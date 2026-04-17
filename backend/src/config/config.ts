import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env do arquivo diretamente (ignora variáveis de sistema)
const envPath = path.resolve(__dirname, '../../.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach((line) => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

console.log('🔍 Environment loaded from .env:', {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  DATABASE_URL: envVars.DATABASE_URL ? 'SET' : 'NOT SET',
  REDIS_URL: envVars.REDIS_URL ? 'SET' : 'NOT SET',
})

export const config = {
  server: {
    port: parseInt(envVars.PORT || '3001'),
    nodeEnv: envVars.NODE_ENV || 'development',
  },
  database: {
    url: envVars.DATABASE_URL || '',
  },
  redis: {
    url: envVars.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: envVars.JWT_SECRET || 'dev-secret',
    expiry: envVars.JWT_EXPIRY || '7d',
  },
  uazapi: {
    url: envVars.UAZ_API_URL || 'https://api.uazapi.com',
    adminToken: envVars.UAZ_ADMIN_TOKEN || '',
  },
  logging: {
    level: envVars.LOG_LEVEL || 'info',
  },
  openai: {
    apiKey: envVars.OPENAI_API_KEY || '',
    model: envVars.OPENAI_MODEL || 'gpt-4',
  },
}
