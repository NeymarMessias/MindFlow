import { getDatabase } from '../db/index.js'
import { whatsappContacts, whatsappMessages, schedules } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger.js'

export class StatsService {
  /**
   * Obter estatísticas gerais do usuário
   */
  async getUserStats(userId: string) {
    try {
      const db = getDatabase()

      // Total de contatos
      const allContacts = await db.query.whatsappContacts.findMany({
        where: eq(whatsappContacts.userId, userId),
      })

      // Contatos ativos
      const activeContacts = allContacts.filter((c: any) => c.status === 'active')

      // Total de mensagens
      const allMessages = await db.query.whatsappMessages.findMany()

      // Contatos por status
      const contactsByStatus = {
        active: allContacts.filter((c: any) => c.status === 'active').length,
        paused: allContacts.filter((c: any) => c.status === 'paused').length,
        unsubscribed: allContacts.filter((c: any) => c.status === 'unsubscribed').length,
      }

      // Mensagens por status
      const messagesByStatus = {
        sent: allMessages.filter((m: any) => m.status === 'sent').length,
        delivered: allMessages.filter((m: any) => m.status === 'delivered').length,
        failed: allMessages.filter((m: any) => m.status === 'failed').length,
      }

      return {
        totalContacts: allContacts.length,
        activeContacts: activeContacts.length,
        totalMessages: allMessages.length,
        contactsByStatus,
        messagesByStatus,
      }
    } catch (error) {
      logger.error('Erro ao obter estatísticas do usuário:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas de contatos
   */
  async getContactStats(userId: string) {
    try {
      const db = getDatabase()

      const contacts = await db.query.whatsappContacts.findMany({
        where: eq(whatsappContacts.userId, userId),
      })

      const stats = {
        total: contacts.length,
        active: contacts.filter((c: any) => c.status === 'active').length,
        paused: contacts.filter((c: any) => c.status === 'paused').length,
        unsubscribed: contacts.filter((c: any) => c.status === 'unsubscribed').length,
      }

      return stats
    } catch (error) {
      logger.error('Erro ao obter estatísticas de contatos:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas de mensagens
   */
  async getMessageStats(userId: string) {
    try {
      const db = getDatabase()

      // Obter contatos do usuário
      const userContacts = await db.query.whatsappContacts.findMany({
        where: eq(whatsappContacts.userId, userId),
      })

      const contactIds = userContacts.map((c: any) => c.id)

      // Obter mensagens dos contatos
      const messages = await db.query.whatsappMessages.findMany()
      const userMessages = messages.filter((m: any) => contactIds.includes(m.contactId))

      const stats = {
        total: userMessages.length,
        sent: userMessages.filter((m: any) => m.status === 'sent').length,
        delivered: userMessages.filter((m: any) => m.status === 'delivered').length,
        failed: userMessages.filter((m: any) => m.status === 'failed').length,
      }

      return stats
    } catch (error) {
      logger.error('Erro ao obter estatísticas de mensagens:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas de agendamentos
   */
  async getScheduleStats(userId: string) {
    try {
      const db = getDatabase()

      const schedulesList = await db.query.schedules.findMany()

      const stats = {
        total: schedulesList.length,
        pending: schedulesList.filter((s: any) => s.status === 'pending').length,
        sent: schedulesList.filter((s: any) => s.status === 'sent').length,
        failed: schedulesList.filter((s: any) => s.status === 'failed').length,
      }

      return stats
    } catch (error) {
      logger.error('Erro ao obter estatísticas de agendamentos:', error)
      throw error
    }
  }

  /**
   * Obter dashboard completo
   */
  async getDashboard(userId: string) {
    try {
      const userStats = await this.getUserStats(userId)
      const contactStats = await this.getContactStats(userId)
      const messageStats = await this.getMessageStats(userId)
      const scheduleStats = await this.getScheduleStats(userId)

      return {
        userStats,
        contactStats,
        messageStats,
        scheduleStats,
      }
    } catch (error) {
      logger.error('Erro ao obter dashboard:', error)
      throw error
    }
  }
}
