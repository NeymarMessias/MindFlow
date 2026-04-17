import { db } from '../db/index'
import { schedules } from '../db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'

export interface CreateScheduleInput {
  contentId: string
  scheduledTime: Date
  dayOfWeek?: number // 0-6 (Sunday-Saturday)
  isRecurring: boolean
  masterUserId: string
}

export interface UpdateScheduleInput {
  contentId?: string
  scheduledTime?: Date
  dayOfWeek?: number
  isRecurring?: boolean
  status?: 'pending' | 'sent' | 'failed' | 'cancelled'
}

export class ScheduleService {
  /**
   * Criar novo agendamento
   */
  async createSchedule(input: CreateScheduleInput) {
    try {
      const result = await db
        .insert(schedules)
        .values({
          contentId: input.contentId,
          scheduledTime: input.scheduledTime,
          dayOfWeek: input.dayOfWeek,
          isRecurring: input.isRecurring,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      logger.info(`Agendamento criado: ${result[0].id}`)

      return {
        id: result[0].id,
        contentId: result[0].contentId,
        scheduledTime: result[0].scheduledTime,
        dayOfWeek: result[0].dayOfWeek,
        isRecurring: result[0].isRecurring,
        status: result[0].status,
        createdAt: result[0].createdAt,
      }
    } catch (error) {
      logger.error(`Erro ao criar agendamento: ${error}`)
      throw error
    }
  }

  /**
   * Listar todos os agendamentos
   */
  async listSchedules() {
    try {
      const allSchedules = await db.select().from(schedules)

      return allSchedules.map((schedule: any) => ({
        id: schedule.id,
        contentId: schedule.contentId,
        scheduledTime: schedule.scheduledTime,
        dayOfWeek: schedule.dayOfWeek,
        isRecurring: schedule.isRecurring,
        status: schedule.status,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      }))
    } catch (error) {
      logger.error(`Erro ao listar agendamentos: ${error}`)
      throw error
    }
  }

  /**
   * Listar agendamentos pendentes
   */
  async listPendingSchedules() {
    try {
      const pending = await db
        .select()
        .from(schedules)
        .where(eq(schedules.status, 'pending'))

      return pending.map((schedule: any) => ({
        id: schedule.id,
        contentId: schedule.contentId,
        scheduledTime: schedule.scheduledTime,
        dayOfWeek: schedule.dayOfWeek,
        isRecurring: schedule.isRecurring,
        status: schedule.status,
      }))
    } catch (error) {
      logger.error(`Erro ao listar agendamentos pendentes: ${error}`)
      throw error
    }
  }

  /**
   * Obter agendamento por ID
   */
  async getSchedule(scheduleId: string) {
    try {
      const schedule = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, scheduleId))
        .limit(1)

      if (schedule.length === 0) {
        throw new Error('Agendamento não encontrado')
      }

      return {
        id: schedule[0].id,
        contentId: schedule[0].contentId,
        scheduledTime: schedule[0].scheduledTime,
        dayOfWeek: schedule[0].dayOfWeek,
        isRecurring: schedule[0].isRecurring,
        status: schedule[0].status,
        createdAt: schedule[0].createdAt,
        updatedAt: schedule[0].updatedAt,
      }
    } catch (error) {
      logger.error(`Erro ao obter agendamento: ${error}`)
      throw error
    }
  }

  /**
   * Atualizar agendamento
   */
  async updateSchedule(scheduleId: string, input: UpdateScheduleInput) {
    try {
      const result = await db
        .update(schedules)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(schedules.id, scheduleId))
        .returning()

      if (result.length === 0) {
        throw new Error('Agendamento não encontrado')
      }

      logger.info(`Agendamento atualizado: ${scheduleId}`)

      return {
        id: result[0].id,
        contentId: result[0].contentId,
        scheduledTime: result[0].scheduledTime,
        dayOfWeek: result[0].dayOfWeek,
        isRecurring: result[0].isRecurring,
        status: result[0].status,
      }
    } catch (error) {
      logger.error(`Erro ao atualizar agendamento: ${error}`)
      throw error
    }
  }

  /**
   * Deletar agendamento
   */
  async deleteSchedule(scheduleId: string) {
    try {
      await db.delete(schedules).where(eq(schedules.id, scheduleId))

      logger.info(`Agendamento deletado: ${scheduleId}`)

      return { success: true }
    } catch (error) {
      logger.error(`Erro ao deletar agendamento: ${error}`)
      throw error
    }
  }

  /**
   * Marcar agendamento como enviado
   */
  async markAsSent(scheduleId: string) {
    return this.updateSchedule(scheduleId, { status: 'sent' })
  }

  /**
   * Marcar agendamento como falha
   */
  async markAsFailed(scheduleId: string) {
    return this.updateSchedule(scheduleId, { status: 'failed' })
  }

  /**
   * Cancelar agendamento
   */
  async cancelSchedule(scheduleId: string) {
    return this.updateSchedule(scheduleId, { status: 'cancelled' })
  }
}

export const scheduleService = new ScheduleService()
