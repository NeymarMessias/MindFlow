import { logger } from '../utils/logger.js'

/**
 * Mock da UAZ API para testes sem credenciais reais
 * Em produção, será substituído pela integração real
 */
export class MockUazService {
  /**
   * Simula envio de mensagem via UAZ API
   */
  async sendMessage(phoneNumber: string, message: string): Promise<any> {
    logger.info(`[MOCK UAZ] Sending message to ${phoneNumber}: ${message}`)

    // Simular delay de envio
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message,
      status: 'sent',
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Simula recebimento de mensagem (para testes)
   */
  async simulateIncomingMessage(phoneNumber: string, message: string): Promise<any> {
    logger.info(`[MOCK UAZ] Simulating incoming message from ${phoneNumber}: ${message}`)

    return {
      event: 'message',
      data: {
        from: phoneNumber,
        body: message,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Simula status de entrega
   */
  async getMessageStatus(messageId: string): Promise<any> {
    logger.info(`[MOCK UAZ] Getting status for message ${messageId}`)

    return {
      messageId,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Simula lista de contatos
   */
  async getContacts(): Promise<any> {
    logger.info(`[MOCK UAZ] Getting contacts list`)

    return {
      success: true,
      contacts: [],
    }
  }
}

export const mockUazService = new MockUazService()
