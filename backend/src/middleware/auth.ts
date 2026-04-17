import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { logger } from '../utils/logger.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, config.jwt.secret)
    req.userId = (decoded as any).userId
    next()
  } catch (error) {
    logger.error('Auth error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Middleware de autenticação com token JWT
 */
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any
    req.userId = decoded.userId

    // Buscar usuário no banco
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)

    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    req.user = user[0]
    next()
  } catch (error) {
    logger.error('Auth error:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
}

/**
 * Middleware para verificar se usuário é Master
 */
export function isMaster(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  if (req.user.userType !== 'master') {
    return res.status(403).json({ error: 'Apenas Master pode acessar este recurso' })
  }

  next()
}
