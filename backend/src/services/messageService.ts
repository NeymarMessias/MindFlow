import { getDatabase } from '../db/index.js'
import { whatsappMessages, whatsappContacts, schedules } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { logger } from '../utils/logger.js'

export class MessageService {
  /**
   * Enviar mensagem para um contato
   */
  async sendMessage(contactId: string, contentId: string, message: string) {
    try {
      const db = getDatabase()

      // Verificar se contato existe e está ativo
      const contact = await db.query.whatsappContacts.findFirst({
        where: eq(whatsappContacts.id, contactId),
      })

      if (!contact) {
        throw new Error('Contato não encontrado')
      }

      if (contact.status !== 'active') {
        throw new Error('Contato não está ativo')
      }

      // Criar registro de mensagem
      const messageId = crypto.randomUUID()
      await db.insert(whatsappMessages).values({
        id: messageId,
        contactId,
        contentId,
        message,
        status: 'sent',
        sentAt: new Date(),
      })

      logger.info(`Mensagem enviada para ${contact.phoneNumber}: ${message}`)

      return { messageId, status: 'sent' }
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  /**
   * Enviar mensagem em massa para múltiplos contatos
   */
  async sendBulkMessages(contactIds: string[], contentId: string, message: string) {
    try {
      const db = getDatabase()
      const results = []

      for (const contactId of contactIds) {
        try {
          const result = await this.sendMessage(contactId, contentId, message)
          results.push({ contactId, success: true, ...result })
        } catch (error) {
          logger.error(`Erro ao enviar para ${contactId}:`, error)
          results.push({ contactId, success: false, error: (error as Error).message })
        }
      }

      return results
    } catch (error) {
      logger.error('Erro ao enviar mensagens em massa:', error)
      throw error
    }
  }

  /**
   * Listar mensagens de um contato
   */
  async listMessages(contactId: string, limit = 50, offset = 0) {
    try {
      const db = getDatabase()

      const messages = await db.query.whatsappMessages.findMany({
        where: eq(whatsappMessages.contactId, contactId),
        limit,
        offset,
      })

      return messages
    } catch (error) {
      logger.error('Erro ao listar mensagens:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas de mensagens
   */
  async getMessageStats(contactId?: string) {
    try {
      const db = getDatabase()

      // Se contactId foi fornecido, obter stats para um contato
      if (contactId) {
        const messages = await db.query.whatsappMessages.findMany({
          where: eq(whatsappMessages.contactId, contactId),
        })

        return {
          total: messages.length,
          sent: messages.filter((m: any) => m.status === 'sent').length,
          delivered: messages.filter((m: any) => m.status === 'delivered').length,
          failed: messages.filter((m: any) => m.status === 'failed').length,
        }
      }

      // Obter stats globais
      const allMessages = await db.query.whatsappMessages.findMany()

      return {
        total: allMessages.length,
        sent: allMessages.filter((m: any) => m.status === 'sent').length,
        delivered: allMessages.filter((m: any) => m.status === 'delivered').length,
        failed: allMessages.filter((m: any) => m.status === 'failed').length,
      }
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error)
      throw error
    }
  }

  /**
   * Marcar mensagem como entregue
   */
  async markAsDelivered(messageId: string) {
    try {
      const db = getDatabase()

      await db.update(whatsappMessages).set({ status: 'delivered' }).where(eq(whatsappMessages.id, messageId))

      logger.info(`Mensagem ${messageId} marcada como entregue`)

      return { messageId, status: 'delivered' }
    } catch (error) {
      logger.error('Erro ao marcar mensagem como entregue:', error)
      throw error
    }
  }

  /**
   * Marcar mensagem como falha
   */
  async markAsFailed(messageId: string, reason?: string) {
    try {
      const db = getDatabase()

      await db.update(whatsappMessages).set({ status: 'failed' }).where(eq(whatsappMessages.id, messageId))

      logger.info(`Mensagem ${messageId} marcada como falha: ${reason}`)

      return { messageId, status: 'failed', reason }
    } catch (error) {
      logger.error('Erro ao marcar mensagem como falha:', error)
      throw error
    }
  }
}
