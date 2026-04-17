import { Router } from 'express'
import { MessageService } from '../services/messageService.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const router: any = Router()
const messageService = new MessageService()

/**
 * POST /api/messages
 * Enviar mensagem para um contato
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { contactId, contentId, message } = req.body

    if (!contactId || !message) {
      return res.status(400).json({ error: 'contactId e message são obrigatórios' })
    }

    const result = await messageService.sendMessage(contactId, contentId, message)
    res.json(result)
  } catch (error: any) {
    logger.error(`Erro ao enviar mensagem: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/messages/bulk
 * Enviar mensagens em massa
 */
router.post('/bulk', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { contactIds, contentId, message } = req.body

    if (!contactIds || !Array.isArray(contactIds) || !message) {
      return res.status(400).json({ error: 'contactIds (array) e message são obrigatórios' })
    }

    const results = await messageService.sendBulkMessages(contactIds, contentId, message)
    res.json(results)
  } catch (error: any) {
    logger.error(`Erro ao enviar mensagens em massa: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/messages/:contactId
 * Listar mensagens de um contato
 */
router.get('/:contactId', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { contactId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const messages = await messageService.listMessages(contactId, parseInt(limit as string), parseInt(offset as string))
    res.json(messages)
  } catch (error: any) {
    logger.error(`Erro ao listar mensagens: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/messages/:contactId/stats
 * Obter estatísticas de mensagens de um contato
 */
router.get('/:contactId/stats', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { contactId } = req.params

    const stats = await messageService.getMessageStats(contactId)
    res.json(stats)
  } catch (error: any) {
    logger.error(`Erro ao obter estatísticas: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/messages/:messageId/delivered
 * Marcar mensagem como entregue
 */
router.patch('/:messageId/delivered', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { messageId } = req.params

    const result = await messageService.markAsDelivered(messageId)
    res.json(result)
  } catch (error: any) {
    logger.error(`Erro ao marcar como entregue: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/messages/:messageId/failed
 * Marcar mensagem como falha
 */
router.patch('/:messageId/failed', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { messageId } = req.params
    const { reason } = req.body

    const result = await messageService.markAsFailed(messageId, reason)
    res.json(result)
  } catch (error: any) {
    logger.error(`Erro ao marcar como falha: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router
