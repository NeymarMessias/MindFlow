import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../db/index.js'
import { contentThemes } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { logger } from '../utils/logger.js'
import { authenticateToken } from '../middleware/auth.js'

const router: Router = Router()

// Default themes
const DEFAULT_THEMES = [
  { name: 'Tecnologia', description: 'Inovações, tendências e notícias de tecnologia' },
  { name: 'Economia', description: 'Análises econômicas, mercado e finanças' },
  { name: 'Política', description: 'Notícias e análises políticas' },
  { name: 'Contabilidade', description: 'Dicas e tendências em contabilidade' },
  { name: 'IA', description: 'Inteligência Artificial e Machine Learning' },
  { name: 'Negócios', description: 'Empreendedorismo e gestão de negócios' },
  { name: 'Língua Inglesa', description: 'Dicas para aprender e melhorar inglês' },
]

// GET /api/themes - Listar temas do usuário
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const db = getDatabase()
    const connection = (db as any).session.client

    // Use raw SQL to fetch themes - incluir temas padrão compartilhados
    const [themes] = await connection.execute(
      'SELECT id, user_id, name, description, is_default, is_active, created_at, updated_at FROM content_themes WHERE user_id = ? OR is_default = 1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    )

    res.json({
      success: true,
      data: themes,
    })
  } catch (error) {
    logger.error('Error fetching themes:', error)
    res.status(500).json({ success: false, error: 'Erro ao buscar temas' })
  }
})

// POST /api/themes/init-defaults - Inicializar temas padrão para novo usuário
router.post('/init-defaults', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const db = getDatabase()

    // Verificar se já tem temas
    const existingThemes = await db.query.contentThemes.findMany({
      where: eq(contentThemes.userId, userId),
    })

    if (existingThemes.length > 0) {
      return res.json({
        success: true,
        message: 'Usuário já possui temas',
        data: existingThemes,
      })
    }

    // Criar temas padrão
    const createdThemes = []
    for (const theme of DEFAULT_THEMES) {
      const themeId = uuidv4()
      await db.insert(contentThemes).values({
        id: themeId,
        userId,
        name: theme.name,
        description: theme.description,
        isDefault: true,
        isActive: true,
      })
      createdThemes.push({ id: themeId, ...theme, isDefault: true, isActive: true })
    }

    logger.info(`✅ Default themes created for user ${userId}`)

    res.json({
      success: true,
      message: 'Temas padrão criados com sucesso',
      data: createdThemes,
    })
  } catch (error) {
    logger.error('Error initializing default themes:', error)
    res.status(500).json({ success: false, error: 'Erro ao criar temas padrão' })
  }
})

// POST /api/themes - Criar novo tema
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: 'Nome do tema é obrigatório' })
    }

    const db = getDatabase()
    const themeId = uuidv4()

    await db.insert(contentThemes).values({
      id: themeId,
      userId,
      name,
      description: description || '',
      isDefault: false,
      isActive: true,
    })

    logger.info(`✅ Theme created: ${name} for user ${userId}`)

    res.status(201).json({
      success: true,
      data: {
        id: themeId,
        userId,
        name,
        description,
        isDefault: false,
        isActive: true,
      },
    })
  } catch (error) {
    logger.error('Error creating theme:', error)
    res.status(500).json({ success: false, error: 'Erro ao criar tema' })
  }
})

// PUT /api/themes/:id - Atualizar tema
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, description, isActive } = req.body

    const db = getDatabase()

    // Verificar se tema pertence ao usuário
    const theme = await db.query.contentThemes.findFirst({
      where: and(eq(contentThemes.id, id), eq(contentThemes.userId, userId)),
    })

    if (!theme) {
      return res.status(404).json({ success: false, error: 'Tema não encontrado' })
    }

    await db
      .update(contentThemes)
      .set({
        name: name || theme.name,
        description: description !== undefined ? description : theme.description,
        isActive: isActive !== undefined ? isActive : theme.isActive,
      })
      .where(eq(contentThemes.id, id))

    logger.info(`✅ Theme updated: ${id}`)

    res.json({
      success: true,
      data: {
        id,
        userId,
        name: name || theme.name,
        description: description !== undefined ? description : theme.description,
        isActive: isActive !== undefined ? isActive : theme.isActive,
      },
    })
  } catch (error) {
    logger.error('Error updating theme:', error)
    res.status(500).json({ success: false, error: 'Erro ao atualizar tema' })
  }
})

// DELETE /api/themes/:id - Deletar tema
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const db = getDatabase()

    // Verificar se tema pertence ao usuário
    const theme = await db.query.contentThemes.findFirst({
      where: and(eq(contentThemes.id, id), eq(contentThemes.userId, userId)),
    })

    if (!theme) {
      return res.status(404).json({ success: false, error: 'Tema não encontrado' })
    }

    // Não permitir deletar temas padrão
    if (theme.isDefault) {
      return res.status(403).json({ success: false, error: 'Não é possível deletar temas padrão' })
    }

    await db.delete(contentThemes).where(eq(contentThemes.id, id))

    logger.info(`✅ Theme deleted: ${id}`)

    res.json({
      success: true,
      message: 'Tema deletado com sucesso',
    })
  } catch (error) {
    logger.error('Error deleting theme:', error)
    res.status(500).json({ success: false, error: 'Erro ao deletar tema' })
  }
})

export default router
