import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { getDatabase } from '../db/index.js'
import { whatsappContacts, whatsappMessages } from '../db/schema.js'
import { config } from '../config/config.js'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger.js'
import { mockUazService } from './mockUazService.js'

export class WhatsAppService {
  async createOrUpdateContact(phoneNumber: string, userId?: string) {
    try {
      const db = getDatabase()

      let contact = await db.query.whatsappContacts.findFirst({
        where: eq(whatsappContacts.phoneNumber, phoneNumber),
      })

      if (contact) {
        // Reativar se desinscritos
        if (contact.status === 'unsubscribed') {
          await db
            .update(whatsappContacts)
            .set({ status: 'active', connectedAt: new Date() })
            .where(eq(whatsappContacts.id, contact.id))
        }
        return contact
      }

      // Criar novo contato
      const contactId = uuidv4()
      await db.insert(whatsappContacts).values({
        id: contactId,
        phoneNumber,
        userId,
        status: 'active',
        firstMessageAt: new Date(),
        connectedAt: new Date(),
        preferredThemes: ['Tecnologia', 'Negócio', 'Marketing', 'Contabilidade'],
        sendTime: '07:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      })

      logger.info(`Contact created: ${phoneNumber}`)

      return { id: contactId, phoneNumber, status: 'active' }
    } catch (error) {
      logger.error('Create/update contact error:', error)
      throw error
    }
  }

  async sendMessage(phoneNumber: string, message: string) {
    try {
      // Se UAZ API não está configurada, usar mock
      if (!config.uazapi.adminToken || config.uazapi.adminToken === 'your-admin-token-here') {
        logger.warn('UAZ API token not configured, using mock service')
        return await mockUazService.sendMessage(phoneNumber, message)
      }

      const response = await axios.post(
        `${config.uazapi.url}/send/text`,
        {
          number: phoneNumber,
          text: message,
        },
        {
          headers: {
            token: config.uazapi.adminToken,
          },
        }
      )

      logger.info(`Message sent to ${phoneNumber}`)
      return response.data
    } catch (error) {
      logger.error(`Failed to send message to ${phoneNumber}:`, error)
      // Fallback para mock em caso de erro
      logger.warn('Falling back to mock service')
      return await mockUazService.sendMessage(phoneNumber, message)
    }
  }

  async logMessage(
    contactId: string,
    direction: 'inbound' | 'outbound',
    message: string,
    status: string = 'sent'
  ) {
    try {
      const db = getDatabase()

      await db.insert(whatsappMessages).values({
        id: uuidv4(),
        contactId,
        direction,
        message,
        status: status as any,
      })

      logger.info(`Message logged for contact ${contactId}`)
    } catch (error) {
      logger.error('Log message error:', error)
      throw error
    }
  }

  async getContacts(userId?: string) {
    try {
      const db = getDatabase()

      if (userId) {
        return await db.query.whatsappContacts.findMany({
          where: eq(whatsappContacts.userId, userId),
        })
      }

      return await db.query.whatsappContacts.findMany()
    } catch (error) {
      logger.error('Get contacts error:', error)
      throw error
    }
  }

  async pauseContact(contactId: string) {
    try {
      const db = getDatabase()

      await db.update(whatsappContacts).set({ status: 'paused' }).where(eq(whatsappContacts.id, contactId))

      logger.info(`Contact paused: ${contactId}`)
    } catch (error) {
      logger.error('Pause contact error:', error)
      throw error
    }
  }

  async resumeContact(contactId: string) {
    try {
      const db = getDatabase()

      await db
        .update(whatsappContacts)
        .set({ status: 'active' })
        .where(eq(whatsappContacts.id, contactId))

      logger.info(`Contact resumed: ${contactId}`)
    } catch (error) {
      logger.error('Resume contact error:', error)
      throw error
    }
  }

  async unsubscribeContact(contactId: string) {
    try {
      const db = getDatabase()

      await db
        .update(whatsappContacts)
        .set({ status: 'unsubscribed' })
        .where(eq(whatsappContacts.id, contactId))

      logger.info(`Contact unsubscribed: ${contactId}`)
    } catch (error) {
      logger.error('Unsubscribe contact error:', error)
      throw error
    }
  }
}

export const whatsappService = new WhatsAppService()
