import { Router, type Router as ExpressRouter } from 'express'
import { WhatsAppService } from '../services/whatsappService.js'
import { logger } from '../utils/logger.js'

const router: ExpressRouter = Router()
const whatsappService = new WhatsAppService()

/**
 * Webhook para receber eventos da UAZ API
 * POST /api/webhooks/whatsapp
 */
router.post('/whatsapp', async (req: any, res: any) => {
  try {
    const event = req.body

    logger.info(`Webhook received: ${JSON.stringify(event)}`)

    // Verificar se é um evento de mensagem recebida
    if (event.event === 'message' || event.type === 'message.received') {
      const phoneNumber = event.data?.from || event.from
      const messageBody = event.data?.body || event.body
      const timestamp = event.data?.timestamp || event.timestamp

      if (!phoneNumber || !messageBody) {
        logger.warn('Webhook received but missing phoneNumber or messageBody')
        return res.json({ success: true })
      }

      logger.info(`Message received from ${phoneNumber}: ${messageBody}`)

      // Processar comando "Quero me conectar"
      if (messageBody.toLowerCase().includes('quero me conectar')) {
        try {
          const contact = await whatsappService.createOrUpdateContact(phoneNumber)

          // Registrar mensagem recebida
          await whatsappService.logMessage(contact.id, 'inbound', messageBody, 'delivered')

          // Enviar mensagem de boas-vindas
          const welcomeMessage = `Bem-vindo ao MindFlow! 🎉

Você receberá conteúdos educativos diários sobre:
📱 Tecnologia
💼 Negócio
📊 Marketing
📈 Contabilidade

Primeiro conteúdo chega amanhã às 7h!

Responda 'PARAR' para desinscrever-se.`

          await whatsappService.sendMessage(phoneNumber, welcomeMessage)
          await whatsappService.logMessage(contact.id, 'outbound', welcomeMessage, 'sent')

          logger.info(`✅ Contact ${phoneNumber} connected successfully`)
        } catch (error) {
          logger.error(`Error connecting contact ${phoneNumber}:`, error)
        }
      }

      // Processar comando "PARAR"
      if (messageBody.toLowerCase().trim() === 'parar') {
        try {
          const contact = await whatsappService.createOrUpdateContact(phoneNumber)
          await whatsappService.unsubscribeContact(contact.id)
          await whatsappService.logMessage(contact.id, 'inbound', messageBody, 'delivered')

          const unsubscribeMessage = 'Você foi desinscritos. Envie "Quero me conectar" para voltar.'
          await whatsappService.sendMessage(phoneNumber, unsubscribeMessage)
          await whatsappService.logMessage(contact.id, 'outbound', unsubscribeMessage, 'sent')

          logger.info(`✅ Contact ${phoneNumber} unsubscribed`)
        } catch (error) {
          logger.error(`Error unsubscribing contact ${phoneNumber}:`, error)
        }
      }

      // Registrar outras mensagens
      if (
        !messageBody.toLowerCase().includes('quero me conectar') &&
        messageBody.toLowerCase().trim() !== 'parar'
      ) {
        try {
          const contact = await whatsappService.createOrUpdateContact(phoneNumber)
          await whatsappService.logMessage(contact.id, 'inbound', messageBody, 'delivered')
          logger.info(`Message logged from ${phoneNumber}`)
        } catch (error) {
          logger.error(`Error logging message from ${phoneNumber}:`, error)
        }
      }
    }

    // Retornar sucesso para UAZ API
    res.json({ success: true })
  } catch (error) {
    logger.error('Webhook error:', error)
    // Ainda retornar 200 para não fazer UAZ API retentar
    res.status(200).json({ success: false, error: (error as Error).message })
  }
})

/**
 * Webhook para verificar se está funcionando
 * GET /api/webhooks/whatsapp
 */
router.get('/whatsapp', (req: any, res: any) => {
  res.json({
    success: true,
    message: 'WhatsApp webhook is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
