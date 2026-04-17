import cron from 'node-cron'
import { getDatabase } from '../db/index.js'
import { schedules, generatedContents, whatsappContacts } from '../db/schema.js'
import { eq, and, lte } from 'drizzle-orm'
import { logger } from '../utils/logger.js'
import { whatsappService } from './whatsappService.js'

export class SchedulerService {
  private cronJob: cron.ScheduledTask | null = null

  /**
   * Iniciar o scheduler de envios automáticos
   * Executa a cada minuto para verificar agendamentos pendentes
   */
  start() {
    if (this.cronJob) {
      logger.info('⏰ Scheduler já está rodando')
      return
    }

    // Executar a cada minuto
    this.cronJob = cron.schedule('* * * * *', async () => {
      try {
        await this.processPendingSchedules()
      } catch (error) {
        logger.error('❌ Erro no scheduler:', error)
      }
    })

    logger.info('⏰ Scheduler iniciado - verificando agendamentos a cada minuto')
  }

  /**
   * Parar o scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      logger.info('⏰ Scheduler parado')
    }
  }

  /**
   * Processar agendamentos pendentes
   */
  private async processPendingSchedules() {
    try {
      const db = getDatabase()
      const now = new Date()

      // Buscar agendamentos pendentes que já passaram da hora
      const pendingSchedules = await db
        .select()
        .from(schedules)
        .where(and(eq(schedules.status, 'pending'), lte(schedules.scheduledTime, now)))

      if (pendingSchedules.length === 0) {
        return // Nenhum agendamento para processar
      }

      logger.info(`📅 Processando ${pendingSchedules.length} agendamentos pendentes`)

      for (const schedule of pendingSchedules) {
        try {
          await this.executeSchedule(schedule)
        } catch (error) {
          logger.error(`❌ Erro ao executar agendamento ${schedule.id}:`, error)
          // Marcar como falha
          await db
            .update(schedules)
            .set({ status: 'failed' })
            .where(eq(schedules.id, schedule.id))
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao processar agendamentos pendentes:', error)
    }
  }

  /**
   * Executar um agendamento específico
   */
  private async executeSchedule(schedule: any) {
    const db = getDatabase()

    // Buscar conteúdo
    const content = await db
      .select()
      .from(generatedContents)
      .where(eq(generatedContents.id, schedule.contentId))
      .limit(1)

    if (content.length === 0) {
      throw new Error('Conteúdo não encontrado')
    }

    const contentData = content[0]

    // Buscar contatos ativos para enviar
    const contacts = await db
      .select()
      .from(whatsappContacts)
      .where(eq(whatsappContacts.status, 'active'))

    logger.info(`📤 Enviando conteúdo para ${contacts.length} contatos`)

    let successCount = 0
    let failureCount = 0

    // Enviar para cada contato
    for (const contact of contacts) {
      try {
        // Preparar mensagem
        const message = `📰 *${contentData.title}*\n\n${contentData.summary}\n\n_Leia o artigo completo em nosso app_`

        // Enviar via WhatsApp
        await whatsappService.sendMessage(contact.phoneNumber, message)

        successCount++
        logger.info(`✅ Mensagem enviada para ${contact.phoneNumber}`)
      } catch (error) {
        failureCount++
        logger.error(`❌ Erro ao enviar para ${contact.phoneNumber}:`, error)
      }
    }

    // Atualizar status do agendamento
    if (successCount > 0) {
      await db
        .update(schedules)
        .set({
          status: 'sent',
          updatedAt: new Date(),
        })
        .where(eq(schedules.id, schedule.id))

      // Se for recorrente, criar novo agendamento para próxima semana
      if (schedule.isRecurring) {
        const nextScheduledTime = new Date(schedule.scheduledTime)
        nextScheduledTime.setDate(nextScheduledTime.getDate() + 7)

        await db.insert(schedules).values({
          id: `${schedule.id}-${Date.now()}`,
          contentId: schedule.contentId,
          scheduledTime: nextScheduledTime,
          dayOfWeek: schedule.dayOfWeek,
          isRecurring: true,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        logger.info(`📅 Próximo agendamento criado para ${nextScheduledTime}`)
      }

      logger.info(`✅ Agendamento ${schedule.id} executado: ${successCount} sucessos, ${failureCount} falhas`)
    } else {
      throw new Error(`Falha ao enviar para todos os ${contacts.length} contatos`)
    }
  }

  /**
   * Criar agendamento manual para enviar conteúdo
   */
  async scheduleContentSend(contentId: string, sendTime: Date, isRecurring: boolean = false) {
    try {
      const db = getDatabase()

      const result = await db.insert(schedules).values({
        id: `schedule-${Date.now()}`,
        contentId,
        scheduledTime: sendTime,
        dayOfWeek: sendTime.getDay(),
        isRecurring,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      logger.info(`✅ Agendamento criado para ${sendTime}`)
      return result
    } catch (error) {
      logger.error('❌ Erro ao criar agendamento:', error)
      throw error
    }
  }
}

export const schedulerService = new SchedulerService()
