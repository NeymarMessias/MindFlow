import { Router, Request, Response } from 'express'
import { scheduleService } from '../services/scheduleService'
import { authenticateToken, isMaster, AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

const router: any = Router()

/**
 * POST /api/schedules
 * Criar novo agendamento (apenas Master)
 */
router.post('/', authenticateToken, isMaster, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, scheduledTime, dayOfWeek, isRecurring } = req.body

    if (!contentId || !scheduledTime) {
      return res.status(400).json({ error: 'ContentId e scheduledTime são obrigatórios' })
    }

    const schedule = await scheduleService.createSchedule({
      contentId,
      scheduledTime: new Date(scheduledTime),
      dayOfWeek,
      isRecurring: isRecurring || false,
      masterUserId: req.user!.id,
    })

    res.status(201).json(schedule)
  } catch (error: any) {
    logger.error(`Erro ao criar agendamento: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/schedules
 * Listar todos os agendamentos (apenas Master)
 */
router.get('/', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const schedules = await scheduleService.listSchedules()
    res.json(schedules)
  } catch (error: any) {
    logger.error(`Erro ao listar agendamentos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/schedules/pending
 * Listar agendamentos pendentes (apenas Master)
 */
router.get('/pending', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const schedules = await scheduleService.listPendingSchedules()
    res.json(schedules)
  } catch (error: any) {
    logger.error(`Erro ao listar agendamentos pendentes: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/schedules/:id
 * Obter agendamento por ID (apenas Master)
 */
router.get('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const schedule = await scheduleService.getSchedule(id)
    res.json(schedule)
  } catch (error: any) {
    logger.error(`Erro ao obter agendamento: ${error.message}`)
    res.status(404).json({ error: error.message })
  }
})

/**
 * PUT /api/schedules/:id
 * Atualizar agendamento (apenas Master)
 */
router.put('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { contentId, scheduledTime, dayOfWeek, isRecurring, status } = req.body

    const schedule = await scheduleService.updateSchedule(id, {
      contentId,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      dayOfWeek,
      isRecurring,
      status,
    })

    res.json(schedule)
  } catch (error: any) {
    logger.error(`Erro ao atualizar agendamento: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * DELETE /api/schedules/:id
 * Deletar agendamento (apenas Master)
 */
router.delete('/:id', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await scheduleService.deleteSchedule(id)
    res.json({ success: true })
  } catch (error: any) {
    logger.error(`Erro ao deletar agendamento: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

/**
 * PATCH /api/schedules/:id/cancel
 * Cancelar agendamento (apenas Master)
 */
router.patch('/:id/cancel', authenticateToken, isMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const schedule = await scheduleService.cancelSchedule(id)
    res.json(schedule)
  } catch (error: any) {
    logger.error(`Erro ao cancelar agendamento: ${error.message}`)
    res.status(400).json({ error: error.message })
  }
})

export default router
