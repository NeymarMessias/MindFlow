import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { initializeDatabase } from './db/index.js'
import { config } from './config/config.js'
import { logger } from './utils/logger.js'
import authRoutes from './routes/auth.js'
import webhookRoutes from './routes/webhooks.js'
import { schedulerService } from './services/schedulerService.js'

export async function startServer() {
  const app = express()

  // Middleware
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(express.static('public'))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
  app.use(limiter)

  // Initialize database
  try {
    await initializeDatabase()
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/users', (await import('./routes/users.js')).default)
  app.use('/api/clients', (await import('./routes/clients.js')).default)
  app.use('/api/contents', (await import('./routes/contents.js')).default)
  app.use('/api/schedules', (await import('./routes/schedules.js')).default)
  app.use('/api/messages', (await import('./routes/messages.js')).default)
  app.use('/api/whatsapp', (await import('./routes/whatsapp.js')).default)
  app.use('/api/stats', (await import('./routes/stats.js')).default)
  app.use('/api/themes', (await import('./routes/themes.js')).default)
  app.use('/api/content', (await import('./routes/content.js')).default)
  app.use('/api/immediate', (await import('./routes/immediate.js')).default)
  app.use('/api/webhooks', webhookRoutes)

  // Serve test page
  app.get('/test', (req, res) => {
    res.sendFile(new URL('../public/test.html', import.meta.url).pathname)
  })

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
  })

  app.listen(config.server.port, () => {
    logger.info(`✅ Server running on port ${config.server.port}`)
    logger.info(`🌍 Environment: ${config.server.nodeEnv}`)
    
    // Iniciar scheduler de envios automáticos
    schedulerService.start()
  })
}
