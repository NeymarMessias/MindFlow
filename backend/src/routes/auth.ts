import { Router } from 'express'
import { AuthService } from '../services/authService.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const router: any = Router()
const authService = new AuthService()

router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    const result = await authService.register(email, password, name)
    res.json(result)
  } catch (error) {
    logger.error('Register error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await authService.login(email, password)
    res.json(result)
  } catch (error) {
    logger.error('Login error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const user = await authService.getUser(req.userId!)
    res.json(user)
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(400).json({ error: (error as Error).message })
  }
})

export default router
