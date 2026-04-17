import { Router, Request, Response } from 'express'
import { immediateMessageService } from '../services/immediateMessageService.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const router: any = Router()

/**
 * POST /api/immediate/send
 * Enviar conteúdo imediatamente para um contato específico
 */
router.post('/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, contactId } = req.body

    if (!contentId || !contactId) {
      return res.status(400).json({ error: 'ContentId e contactId são obrigatórios' })
    }

    const result = await immediateMessageService.sendContentNow(contentId, contactId)
    res.status(200).json(result)
  } catch (error: any) {
    logger.error(`Erro ao enviar conteúdo imediatamente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /api/immediate/send-all
 * Enviar conteúdo para todos os contatos ativos
 */
router.post('/send-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.body

    if (!contentId) {
      return res.status(400).json({ error: 'ContentId é obrigatório' })
    }

    const result = await immediateMessageService.sendContentToAllContacts(contentId)
    res.status(200).json(result)
  } catch (error: any) {
    logger.error(`Erro ao enviar para todos os contatos: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /api/immediate/feedback
 * Registrar feedback de um contato sobre um conteúdo
 */
router.post('/feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, contactId, rating, feedback } = req.body

    if (!contentId || !contactId || !rating) {
      return res.status(400).json({ error: 'ContentId, contactId e rating são obrigatórios' })
    }

    const result = await immediateMessageService.recordFeedback(contentId, contactId, rating, feedback)
    res.status(201).json(result)
  } catch (error: any) {
    logger.error(`Erro ao registrar feedback: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/immediate/preferences/:contactId
 * Obter temas preferidos de um contato baseado em feedback
 */
router.get('/preferences/:contactId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params

    const preferences = await immediateMessageService.getContactPreferredThemes(contactId)
    res.status(200).json(preferences)
  } catch (error: any) {
    logger.error(`Erro ao obter preferências: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router
