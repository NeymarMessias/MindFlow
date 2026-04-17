import { v4 as uuidv4 } from 'uuid'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../db/index.js'
import { users } from '../db/schema.js'
import { config } from '../config/config.js'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger.js'

export class AuthService {
  async register(email: string, password: string, name: string) {
    try {
      const db = getDatabase()

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      const hashedPassword = await bcryptjs.hash(password, 10)
      const userId = uuidv4()

      await db.insert(users).values({
        id: userId,
        email,
        passwordHash: hashedPassword,
        name,
      })

      const token = jwt.sign({ userId }, config.jwt.secret as string, {
        expiresIn: config.jwt.expiry as string,
      } as any)

      logger.info(`User registered: ${email}`)

      return { userId, token, email, name, userType: 'client', plan: 'free' }
    } catch (error) {
      logger.error('Register error:', error)
      throw error
    }
  }

  async login(email: string, password: string) {
    try {
      const db = getDatabase()

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user) {
        throw new Error('User not found')
      }

      const isPasswordValid = await bcryptjs.compare(password, user.passwordHash)
      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      const token = jwt.sign({ userId: user.id }, config.jwt.secret as string, {
        expiresIn: config.jwt.expiry as string,
      } as any)

      logger.info(`User logged in: ${email}`)

      return { userId: user.id, token, email: user.email, name: user.name, userType: user.userType, plan: user.plan }
    } catch (error) {
      logger.error('Login error:', error)
      throw error
    }
  }

  async getUser(userId: string) {
    try {
      const db = getDatabase()

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        throw new Error('User not found')
      }

      return { userId: user.id, email: user.email, name: user.name, userType: user.userType, plan: user.plan, isProtected: user.isProtected }
    } catch (error) {
      logger.error('Get user error:', error)
      throw error
    }
  }
}
