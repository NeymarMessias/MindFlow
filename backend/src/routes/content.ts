import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../db/index.js'
import { generatedContents, contentThemes } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { logger } from '../utils/logger.js'
import { authenticateToken } from '../middleware/auth.js'
import { openaiService } from '../services/openaiService.js'

const router: Router = Router()

// GET /api/content - Listar conteúdos gerados
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { themeId, status } = req.query
    const db = getDatabase()

    let query = db.query.generatedContents.findMany({
      where: eq(generatedContents.userId, userId),
    })

    const contents = await query

    // Filtrar por tema se especificado
    let filtered = contents
    if (themeId) {
      filtered = filtered.filter((c: any) => c.themeId === themeId)
    }
    if (status) {
      filtered = filtered.filter((c: any) => c.status === status)
    }

    res.json({
      success: true,
      data: filtered,
    })
  } catch (error) {
    logger.error('Error fetching contents:', error)
    res.status(500).json({ success: false, error: 'Erro ao buscar conteúdos' })
  }
})

// POST /api/content/generate - Gerar novo conteúdo
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { themeId } = req.body

    if (!themeId) {
      return res.status(400).json({ success: false, error: 'themeId é obrigatório' })
    }

    const db = getDatabase()

    // Verificar se tema existe (pode ser padrão ou do usuário)
    const theme = await db.query.contentThemes.findFirst({
      where: eq(contentThemes.id, themeId),
    })

    if (!theme) {
      return res.status(404).json({ success: false, error: 'Tema não encontrado' })
    }

    // Buscar tópicos recentes para evitar repetição
    const recentContents = await db.query.generatedContents.findMany({
      where: and(eq(generatedContents.userId, userId), eq(generatedContents.themeId, themeId)),
    })

    const recentTitles = recentContents.slice(0, 5).map((c: any) => c.title)

    // Gerar conteúdo com OpenAI
    logger.info(`🤖 Generating content for theme: ${theme.name}`)
    const generatedContent = await openaiService.generateContent(theme.name, recentTitles)

    // Salvar no banco de dados
    const contentId = uuidv4()
    await db.insert(generatedContents).values({
      id: contentId,
      userId,
      themeId,
      title: generatedContent.title,
      content: generatedContent.content,
      summary: generatedContent.summary,
      wordCount: generatedContent.wordCount,
      status: 'generated',
    })

    logger.info(`✅ Content generated and saved: ${contentId}`)

    res.status(201).json({
      success: true,
      data: {
        id: contentId,
        userId,
        themeId,
        title: generatedContent.title,
        content: generatedContent.content,
        summary: generatedContent.summary,
        wordCount: generatedContent.wordCount,
        status: 'generated',
      },
    })
  } catch (error) {
    logger.error('Error generating content:', error)
    res.status(500).json({ success: false, error: 'Erro ao gerar conteúdo' })
  }
})

// PUT /api/content/:id - Atualizar conteúdo
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { status, scheduledFor } = req.body

    const db = getDatabase()

    // Verificar se conteúdo pertence ao usuário
    const content = await db.query.generatedContents.findFirst({
      where: and(eq(generatedContents.id, id), eq(generatedContents.userId, userId)),
    })

    if (!content) {
      return res.status(404).json({ success: false, error: 'Conteúdo não encontrado' })
    }

    await db
      .update(generatedContents)
      .set({
        status: status || content.status,
        scheduledFor: scheduledFor || content.scheduledFor,
      })
      .where(eq(generatedContents.id, id))

    logger.info(`✅ Content updated: ${id}`)

    res.json({
      success: true,
      data: {
        id,
        status: status || content.status,
        scheduledFor: scheduledFor || content.scheduledFor,
      },
    })
  } catch (error) {
    logger.error('Error updating content:', error)
    res.status(500).json({ success: false, error: 'Erro ao atualizar conteúdo' })
  }
})

// DELETE /api/content/:id - Deletar conteúdo
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const db = getDatabase()

    // Verificar se conteúdo pertence ao usuário
    const content = await db.query.generatedContents.findFirst({
      where: and(eq(generatedContents.id, id), eq(generatedContents.userId, userId)),
    })

    if (!content) {
      return res.status(404).json({ success: false, error: 'Conteúdo não encontrado' })
    }

    await db.delete(generatedContents).where(eq(generatedContents.id, id))

    logger.info(`✅ Content deleted: ${id}`)

    res.json({
      success: true,
      message: 'Conteúdo deletado com sucesso',
    })
  } catch (error) {
    logger.error('Error deleting content:', error)
    res.status(500).json({ success: false, error: 'Erro ao deletar conteúdo' })
  }
})

export default router
