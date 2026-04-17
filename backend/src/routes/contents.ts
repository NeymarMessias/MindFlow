import { Router, Request, Response } from 'express'
import { contentService } from '../services/contentService'
import { authenticateToken, isMaster, AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

const router: any = Router()

/**
 * POST /api/contents
 * Criar novo conteúdo (apenas Master)
 */
router.post('/', authenticateToken, isMaster, async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, imageUrl, type, channel } = req.body

    if (!title || !body || !type || !channel) {
      return res.status(400).json({ error: 'Título, corpo, tipo e canal são obrigatórios' })
    }

    const content = await contentService.createContent({
      title,
      body,
      imageUrl,
      type,
      channel,
      masterUserId: req.user!.id,
    })

    res.status(201).json(content)
  } catch (error: any) {
    logger.error(`Erro ao criar conteúdo: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/contents
 * Listar todos os conteúdos (apenas Master)
 */
router.get('/', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const contents = await contentService.listContents()
    res.json(contents)
  } catch (error: any) {
    logger.error(`Erro ao listar conteúdos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/contents/:id
 * Obter conteúdo por ID (apenas Master)
 */
router.get('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const content = await contentService.getContent(id)
    res.json(content)
  } catch (error: any) {
    logger.error(`Erro ao obter conteúdo: ${error.message}`)
    res.status(404).json({ error: error.message })
  }
})

/**
 * PUT /api/contents/:id
 * Atualizar conteúdo (apenas Master)
 */
router.put('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, body, imageUrl, type, channel, status } = req.body

    const content = await contentService.updateContent(id, {
      title,
      body,
      imageUrl,
      type,
      channel,
      status,
    })

    res.json(content)
  } catch (error: any) {
    logger.error(`Erro ao atualizar conteúdo: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * DELETE /api/contents/:id
 * Deletar conteúdo (apenas Master)
 */
router.delete('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await contentService.deleteContent(id)
    res.json({ success: true })
  } catch (error: any) {
    logger.error(`Erro ao deletar conteúdo: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/contents/:id/publish
 * Publicar conteúdo (apenas Master)
 */
router.patch('/:id/publish', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const content = await contentService.publishContent(id)
    res.json(content)
  } catch (error: any) {
    logger.error(`Erro ao publicar conteúdo: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/contents/:id/archive
 * Arquivar conteúdo (apenas Master)
 */
router.patch('/:id/archive', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const content = await contentService.archiveContent(id)
    res.json(content)
  } catch (error: any) {
    logger.error(`Erro ao arquivar conteúdo: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

export default router
