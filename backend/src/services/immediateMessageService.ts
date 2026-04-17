import { getDatabase } from '../db/index.js'
import { generatedContents, whatsappContacts, whatsappMessages, contentFeedback } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger.js'
import { whatsappService } from './whatsappService.js'
import { v4 as uuidv4 } from 'uuid'

export class ImmediateMessageService {
  /**
   * Enviar conteúdo imediatamente para um contato
   */
  async sendContentNow(contentId: string, contactId: string) {
    try {
      const db = getDatabase()

      // Buscar conteúdo
      const content = await db
        .select()
        .from(generatedContents)
        .where(eq(generatedContents.id, contentId))
        .limit(1)

      if (content.length === 0) {
        throw new Error('Conteúdo não encontrado')
      }

      const contentData = content[0]

      // Buscar contato
      const contact = await db
        .select()
        .from(whatsappContacts)
        .where(eq(whatsappContacts.id, contactId))
        .limit(1)

      if (contact.length === 0) {
        throw new Error('Contato não encontrado')
      }

      const contactData = contact[0]

      // Preparar mensagem
      const message = `📰 *${contentData.title}*\n\n${contentData.summary}\n\n_Leia o artigo completo em nosso app_`

      // Enviar via WhatsApp
      await whatsappService.sendMessage(contactData.phoneNumber, message)

      // Registrar mensagem
      const messageId = uuidv4()
      await db.insert(whatsappMessages).values({
        id: messageId,
        contactId: contactData.id,
        direction: 'outbound',
        message: message,
        status: 'sent',
        timestamp: new Date(),
      })

      // Atualizar status do conteúdo
      await db
        .update(generatedContents)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(generatedContents.id, contentId))

      logger.info(`✅ Conteúdo enviado imediatamente para ${contactData.phoneNumber}`)

      return {
        success: true,
        messageId,
        contactPhone: contactData.phoneNumber,
        contentTitle: contentData.title,
      }
    } catch (error) {
      logger.error('❌ Erro ao enviar conteúdo imediatamente:', error)
      throw error
    }
  }

  /**
   * Enviar conteúdo para todos os contatos ativos
   */
  async sendContentToAllContacts(contentId: string) {
    try {
      const db = getDatabase()

      // Buscar conteúdo
      const content = await db
        .select()
        .from(generatedContents)
        .where(eq(generatedContents.id, contentId))
        .limit(1)

      if (content.length === 0) {
        throw new Error('Conteúdo não encontrado')
      }

      const contentData = content[0]

      // Buscar contatos ativos
      const contacts = await db
        .select()
        .from(whatsappContacts)
        .where(eq(whatsappContacts.status, 'active'))

      logger.info(`📤 Enviando conteúdo para ${contacts.length} contatos`)

      let successCount = 0
      let failureCount = 0

      // Enviar para cada contato
      for (const contact of contacts) {
        try {
          // Preparar mensagem
          const message = `📰 *${contentData.title}*\n\n${contentData.summary}\n\n_Leia o artigo completo em nosso app_`

          // Enviar via WhatsApp
          await whatsappService.sendMessage(contact.phoneNumber, message)

          // Registrar mensagem
          const messageId = uuidv4()
          await db.insert(whatsappMessages).values({
            id: messageId,
            contactId: contact.id,
            direction: 'outbound',
            message: message,
            status: 'sent',
            timestamp: new Date(),
          })

          successCount++
          logger.info(`✅ Mensagem enviada para ${contact.phoneNumber}`)
        } catch (error) {
          failureCount++
          logger.error(`❌ Erro ao enviar para ${contact.phoneNumber}:`, error)
        }
      }

      // Atualizar status do conteúdo
      await db
        .update(generatedContents)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(generatedContents.id, contentId))

      logger.info(`✅ Envio concluído: ${successCount} sucessos, ${failureCount} falhas`)

      return {
        success: true,
        successCount,
        failureCount,
        totalContacts: contacts.length,
      }
    } catch (error) {
      logger.error('❌ Erro ao enviar para todos os contatos:', error)
      throw error
    }
  }

  /**
   * Registrar feedback de um contato
   */
  async recordFeedback(contentId: string, contactId: string, rating: number, feedback?: string) {
    try {
      const db = getDatabase()

      // Validar rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating deve estar entre 1 e 5')
      }

      // Buscar conteúdo para obter o tema
      const content = await db
        .select()
        .from(generatedContents)
        .where(eq(generatedContents.id, contentId))
        .limit(1)

      if (content.length === 0) {
        throw new Error('Conteúdo não encontrado')
      }

      const contentData = content[0]
      const theme = contentData.themeId

      // Registrar feedback
      const feedbackId = uuidv4()
      await db.insert(contentFeedback).values({
        id: feedbackId,
        contentId,
        contactId,
        rating,
        theme,
        feedback: feedback || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Atualizar preferências de tema do contato
      await this.updateContactThemePreference(contactId, theme, rating)

      logger.info(`⭐ Feedback registrado: ${rating} estrelas para tema ${theme}`)

      return {
        success: true,
        feedbackId,
        rating,
      }
    } catch (error) {
      logger.error('❌ Erro ao registrar feedback:', error)
      throw error
    }
  }

  /**
   * Atualizar preferências de tema baseado em feedback
   */
  private async updateContactThemePreference(contactId: string, theme: string, newRating: number) {
    try {
      const db = getDatabase()

      // Buscar preferência existente
      const existing = await db
        .select()
        .from(contentFeedback)
        .where(eq(contentFeedback.contactId, contactId))

      const themeRatings = existing.filter((f: any) => f.theme === theme)

      if (themeRatings.length === 0) {
        // Primeira avaliação para este tema
        logger.info(`📊 Primeira avaliação para tema ${theme}`)
        return
      }

      // Calcular média de ratings
      const allRatings = themeRatings.map((f: any) => f.rating)
      const averageRating = Math.round(
        (allRatings.reduce((a: number, b: number) => a + b, 0) + newRating) / (allRatings.length + 1)
      )

      logger.info(`📊 Tema ${theme}: Média de ${averageRating} estrelas (${allRatings.length + 1} avaliações)`)
    } catch (error) {
      logger.error('❌ Erro ao atualizar preferência de tema:', error)
    }
  }

  /**
   * Obter temas preferidos de um contato baseado em feedback
   */
  async getContactPreferredThemes(contactId: string) {
    try {
      const db = getDatabase()

      // Buscar todos os feedbacks do contato
      const feedbacks = await db
        .select()
        .from(contentFeedback)
        .where(eq(contentFeedback.contactId, contactId))

      // Agrupar por tema e calcular média
      const themeStats: { [key: string]: { ratings: number[]; average: number; count: number } } = {}

      for (const feedback of feedbacks) {
        if (!themeStats[feedback.theme]) {
          themeStats[feedback.theme] = { ratings: [], average: 0, count: 0 }
        }
        themeStats[feedback.theme].ratings.push(feedback.rating)
        themeStats[feedback.theme].count++
      }

      // Calcular médias
      for (const theme in themeStats) {
        const ratings = themeStats[theme].ratings
        themeStats[theme].average = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      }

      // Ordenar por média (descendente)
      const sortedThemes = Object.entries(themeStats)
        .sort((a, b) => b[1].average - a[1].average)
        .map(([theme, stats]) => ({
          theme,
          averageRating: stats.average,
          feedbackCount: stats.count,
        }))

      logger.info(`📊 Temas preferidos do contato ${contactId}: ${JSON.stringify(sortedThemes)}`)

      return sortedThemes
    } catch (error) {
      logger.error('❌ Erro ao obter temas preferidos:', error)
      return []
    }
  }
}

export const immediateMessageService = new ImmediateMessageService()
