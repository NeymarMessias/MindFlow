import { Router, Request, Response } from 'express'
import { clientService } from '../services/clientService'
import { authenticateToken, isMaster, AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

const router: any = Router()

/**
 * POST /api/clients
 * Criar novo cliente (apenas Master)
 */
router.post('/', authenticateToken, isMaster, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, plan } = req.body

    if (!email || !password || !name || !plan) {
      return res.status(400).json({ error: 'Email, senha, nome e plano são obrigatórios' })
    }

    const client = await clientService.createClient({
      email,
      password,
      name,
      plan,
      masterUserId: req.user!.id,
    })

    res.status(201).json(client)
  } catch (error: any) {
    logger.error(`Erro ao criar cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/clients
 * Listar todos os clientes (apenas Master)
 */
router.get('/', authenticateToken, isMaster, async (req: AuthRequest, res: Response) => {
  try {
    const clients = await clientService.listClients(req.user!.id)
    res.json(clients)
  } catch (error: any) {
    logger.error(`Erro ao listar clientes: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/clients/:id
 * Obter cliente por ID (apenas Master)
 */
router.get('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const client = await clientService.getClient(id)
    res.json(client)
  } catch (error: any) {
    logger.error(`Erro ao obter cliente: ${error.message}`)
    res.status(404).json({ error: error.message })
  }
})

/**
 * PUT /api/clients/:id
 * Atualizar cliente (apenas Master)
 */
router.put('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, plan, status } = req.body

    const client = await clientService.updateClient(id, {
      name,
      plan,
      status,
    })

    res.json(client)
  } catch (error: any) {
    logger.error(`Erro ao atualizar cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * DELETE /api/clients/:id
 * Deletar cliente (apenas Master)
 */
router.delete('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await clientService.deleteClient(id)
    res.json({ success: true })
  } catch (error: any) {
    logger.error(`Erro ao deletar cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/clients/:id/pause
 * Pausar cliente (apenas Master)
 */
router.patch('/:id/pause', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const client = await clientService.pauseClient(id)
    res.json(client)
  } catch (error: any) {
    logger.error(`Erro ao pausar cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/clients/:id/resume
 * Retomar cliente (apenas Master)
 */
router.patch('/:id/resume', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const client = await clientService.resumeClient(id)
    res.json(client)
  } catch (error: any) {
    logger.error(`Erro ao retomar cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/clients/:id/suspend
 * Suspender cliente (apenas Master)
 */
router.patch('/:id/suspend', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const client = await clientService.suspendClient(id)
    res.json(client)
  } catch (error: any) {
    logger.error(`Erro ao suspender cliente: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

export default router
