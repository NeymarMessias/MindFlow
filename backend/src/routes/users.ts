import { Router } from 'express'
import { AuthService } from '../services/authService.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import { getDatabase } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import bcryptjs from 'bcryptjs'

const router: any = Router()
const authService = new AuthService()

// Middleware para verificar se é master
async function isMaster(req: AuthRequest, res: any, next: any) {
  try {
    const db = getDatabase()
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    })

    if (!user || user.userType !== 'master') {
      return res.status(403).json({ error: 'Apenas usuários master podem acessar este recurso' })
    }

    next()
  } catch (error) {
    logger.error('Master check error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
}

// Listar todos os usuários (apenas master)
router.get('/', authMiddleware, isMaster, async (req: AuthRequest, res: any) => {
  try {
    const db = getDatabase()
    const allUsers = await db.query.users.findMany()

    const sanitized = allUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      userType: u.userType,
      plan: u.plan,
      status: u.status,
      isProtected: u.isProtected,
      createdAt: u.createdAt,
    }))

    res.json(sanitized)
  } catch (error) {
    logger.error('List users error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

// Criar novo cliente (apenas master)
router.post('/create-client', authMiddleware, isMaster, async (req: AuthRequest, res: any) => {
  try {
    const { email, password, name, plan } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password e name são obrigatórios' })
    }

    const db = getDatabase()

    // Verificar se email já existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    const userId = uuidv4()

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash: hashedPassword,
      name,
      userType: 'client',
      plan: plan || 'free',
      status: 'active',
      isProtected: false,
    })

    logger.info(`Client created by master: ${email}`)

    res.json({
      userId,
      email,
      name,
      userType: 'client',
      plan: plan || 'free',
      message: 'Cliente criado com sucesso',
    })
  } catch (error) {
    logger.error('Create client error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

// Atualizar status do usuário (apenas master)
router.patch('/:userId/status', authMiddleware, isMaster, async (req: AuthRequest, res: any) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const db = getDatabase()

    // Verificar se usuário existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Não permitir alterar usuário master
    if (user.isProtected) {
      return res.status(403).json({ error: 'Não é possível alterar usuário protegido' })
    }

    await db.update(users).set({ status }).where(eq(users.id, userId))

    logger.info(`User status updated by master: ${userId} -> ${status}`)

    res.json({ message: 'Status atualizado com sucesso' })
  } catch (error) {
    logger.error('Update status error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

// Alterar plano do usuário (apenas master)
router.patch('/:userId/plan', authMiddleware, isMaster, async (req: AuthRequest, res: any) => {
  try {
    const { userId } = req.params
    const { plan } = req.body

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' })
    }

    const db = getDatabase()

    // Verificar se usuário existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    await db.update(users).set({ plan }).where(eq(users.id, userId))

    logger.info(`User plan updated by master: ${userId} -> ${plan}`)

    res.json({ message: 'Plano atualizado com sucesso' })
  } catch (error) {
    logger.error('Update plan error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

// Deletar usuário (apenas master, não pode deletar protegidos)
router.delete('/:userId', authMiddleware, isMaster, async (req: AuthRequest, res: any) => {
  try {
    const { userId } = req.params

    const db = getDatabase()

    // Verificar se usuário existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Não permitir deletar usuário protegido
    if (user.isProtected) {
      return res.status(403).json({ error: 'Não é possível deletar usuário protegido' })
    }

    // Não permitir deletar a si mesmo
    if (userId === req.userId) {
      return res.status(403).json({ error: 'Não é possível deletar sua própria conta' })
    }

    await db.delete(users).where(eq(users.id, userId))

    logger.info(`User deleted by master: ${userId}`)

    res.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    logger.error('Delete user error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

export default router
