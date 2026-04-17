import mysql from 'mysql2/promise'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ler .env
const envPath = path.resolve(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach((line) => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

// Parse DATABASE_URL
const url = new URL(envVars.DATABASE_URL)
const connectionConfig = {
  host: url.hostname === 'localhost' ? '127.0.0.1' : url.hostname,
  port: parseInt(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
}

console.log('🔌 Conectando ao banco de dados...')
const connection = await mysql.createConnection(connectionConfig)

try {
  // Verificar se já existe usuário master
  const [existingMaster] = await connection.execute(
    'SELECT * FROM users WHERE user_type = ? LIMIT 1',
    ['master']
  )

  if (existingMaster.length > 0) {
    console.log('⚠️  Usuário master já existe!')
    console.log('Email:', existingMaster[0].email)
    process.exit(0)
  }

  // Criar usuário master
  const masterEmail = 'master@mindflow.com'
  const masterPassword = 'MindFlow@Master123'
  const masterName = 'MindFlow Master'
  const masterUserId = uuidv4()

  const hashedPassword = await bcryptjs.hash(masterPassword, 10)

  await connection.execute(
    `INSERT INTO users (id, email, password_hash, name, user_type, plan, status, is_protected) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [masterUserId, masterEmail, hashedPassword, masterName, 'master', 'enterprise', 'active', true]
  )

  console.log('\n✅ Usuário Master criado com sucesso!\n')
  console.log('📧 Email:', masterEmail)
  console.log('🔐 Senha:', masterPassword)
  console.log('👤 Nome:', masterName)
  console.log('🛡️  Protegido contra exclusão: SIM')
  console.log('📋 Tipo: Master')
  console.log('💼 Plano: Enterprise')
  console.log('\n⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!')
  console.log('💡 Você pode alterar a senha após o primeiro login.')

  process.exit(0)
} catch (error) {
  console.error('❌ Erro ao criar usuário master:', error.message)
  process.exit(1)
} finally {
  await connection.end()
}
