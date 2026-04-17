import { Router } from 'express'
import { StatsService } from '../services/statsService.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const router: any = Router()
const statsService = new StatsService()

/**
 * GET /api/stats
 * Obter dashboard completo
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const dashboard = await statsService.getDashboard(req.userId!)
    res.json(dashboard)
  } catch (error: any) {
    logger.error(`Erro ao obter dashboard: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stats/user
 * Obter estatísticas gerais do usuário
 */
router.get('/user', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const stats = await statsService.getUserStats(req.userId!)
    res.json(stats)
  } catch (error: any) {
    logger.error(`Erro ao obter estatísticas do usuário: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stats/contacts
 * Obter estatísticas de contatos
 */
router.get('/contacts', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const stats = await statsService.getContactStats(req.userId!)
    res.json(stats)
  } catch (error: any) {
    logger.error(`Erro ao obter estatísticas de contatos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stats/messages
 * Obter estatísticas de mensagens
 */
router.get('/messages', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const stats = await statsService.getMessageStats(req.userId!)
    res.json(stats)
  } catch (error: any) {
    logger.error(`Erro ao obter estatísticas de mensagens: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stats/schedules
 * Obter estatísticas de agendamentos
 */
router.get('/schedules', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const stats = await statsService.getScheduleStats(req.userId!)
    res.json(stats)
  } catch (error: any) {
    logger.error(`Erro ao obter estatísticas de agendamentos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router
