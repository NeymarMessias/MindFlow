import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema.js'
import { config } from '../config/config.js'

export let db: any

export async function initializeDatabase() {
  try {
    // Parse connection URL
    const url = new URL(config.database.url)
    const connectionConfig = {
      host: url.hostname === 'localhost' ? '127.0.0.1' : url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    }
    
    console.log('🔌 Connecting to database:', { ...connectionConfig, password: '***' })
    const connection = await mysql.createConnection(connectionConfig)
    db = drizzle(connection, { schema, mode: 'default' })
    console.log('✅ Database connected successfully')
    return db
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}
