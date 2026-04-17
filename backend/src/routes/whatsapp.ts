import { Router, type Router as ExpressRouter } from 'express'
import { WhatsAppService } from '../services/whatsappService.js'
import { authMiddleware } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const router: ExpressRouter = Router()
const whatsappService = new WhatsAppService()

// Middleware de autenticação
router.use(authMiddleware)

/**
 * GET /api/whatsapp/contacts
 * Listar contatos WhatsApp do usuário
 */
router.get('/contacts', async (req: any, res: any) => {
  try {
    const userId = req.user?.id
    const contacts = await whatsappService.getContacts(userId)

    res.json({
      success: true,
      data: contacts,
      total: contacts.length,
    })
  } catch (error) {
    logger.error('Get contacts error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/whatsapp/send
 * Enviar mensagem manual para um contato
 */
router.post('/send', async (req: any, res: any) => {
  try {
    const { phoneNumber, message, contentId } = req.body

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' })
    }

    // Enviar via UAZ API
    const result = await whatsappService.sendMessage(phoneNumber, message)

    // Registrar no banco de dados
    const contact = await whatsappService.createOrUpdateContact(phoneNumber, req.user?.id)
    await whatsappService.logMessage(contact.id, 'outbound', message, 'sent')

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result,
    })
  } catch (error) {
    logger.error('Send message error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/whatsapp/broadcast
 * Enviar mensagem em massa para múltiplos contatos
 */
router.post('/broadcast', async (req: any, res: any) => {
  try {
    const { message, contactIds, theme } = req.body
    const userId = req.user?.id

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    let contacts = await whatsappService.getContacts(userId)

    // Filtrar por contatos específicos se fornecidos
    if (contactIds && Array.isArray(contactIds)) {
      contacts = contacts.filter((c: any) => contactIds.includes(c.id))
    }

    // Filtrar por tema se fornecido
    if (theme) {
      contacts = contacts.filter((c: any) => {
        const themes = c.preferredThemes || []
        return Array.isArray(themes) ? themes.includes(theme) : false
      })
    }

    // Filtrar apenas contatos ativos
    contacts = contacts.filter((c: any) => c.status === 'active')

    const results = []
    const errors = []

    for (const contact of contacts) {
      try {
        await whatsappService.sendMessage(contact.phoneNumber, message)
        await whatsappService.logMessage(contact.id, 'outbound', message, 'sent')
        results.push({ contactId: contact.id, status: 'sent' })
      } catch (error) {
        logger.error(`Failed to send to ${contact.phoneNumber}:`, error)
        errors.push({ contactId: contact.id, error: (error as Error).message })
      }
    }

    res.json({
      success: true,
      message: 'Broadcast completed',
      totalContacts: contacts.length,
      sent: results.length,
      failed: errors.length,
      data: { results, errors },
    })
  } catch (error) {
    logger.error('Broadcast error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/whatsapp/contacts/:id/pause
 * Pausar envio de mensagens para um contato
 */
router.post('/contacts/:id/pause', async (req: any, res: any) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' })
    }

    await whatsappService.pauseContact(id)

    res.json({
      success: true,
      message: 'Contact paused successfully',
    })
  } catch (error) {
    logger.error('Pause contact error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/whatsapp/contacts/:id/resume
 * Retomar envio de mensagens para um contato
 */
router.post('/contacts/:id/resume', async (req: any, res: any) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' })
    }

    await whatsappService.resumeContact(id)

    res.json({
      success: true,
      message: 'Contact resumed successfully',
    })
  } catch (error) {
    logger.error('Resume contact error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/whatsapp/contacts/:id/unsubscribe
 * Desinscrever um contato
 */
router.post('/contacts/:id/unsubscribe', async (req: any, res: any) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' })
    }

    await whatsappService.unsubscribeContact(id)

    res.json({
      success: true,
      message: 'Contact unsubscribed successfully',
    })
  } catch (error) {
    logger.error('Unsubscribe contact error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/whatsapp/contacts/:id
 * Obter detalhes de um contato
 */
router.get('/contacts/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params
    const db = (await import('../db/index.js')).getDatabase()
    const { whatsappContacts } = await import('../db/schema.js')
    const { eq } = await import('drizzle-orm')

    const contact = await db.query.whatsappContacts.findFirst({
      where: eq(whatsappContacts.id, id),
    })

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    res.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    logger.error('Get contact error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
