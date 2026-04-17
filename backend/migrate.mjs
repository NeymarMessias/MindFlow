import mysql from 'mysql2/promise'
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

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    user_type ENUM('master', 'client') DEFAULT 'client',
    plan ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    is_protected BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_user_type (user_type)
  )`,

  // WhatsApp Contacts table
  `CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('active', 'paused', 'unsubscribed') DEFAULT 'active',
    first_message_at TIMESTAMP NULL,
    connected_at TIMESTAMP NULL,
    last_message_at TIMESTAMP NULL,
    preferred_themes JSON,
    send_time VARCHAR(5) DEFAULT '07:00',
    days_of_week JSON,
    messages_sent INT DEFAULT 0,
    messages_read INT DEFAULT 0,
    messages_failed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_phone (phone_number)
  )`,

  // Contents table
  `CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    theme ENUM('Tecnologia', 'Negócio', 'Marketing', 'Contabilidade'),
    status ENUM('generated', 'sent', 'approved', 'posted') DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_theme (theme),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
  )`,

  // Schedules table
  `CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    time VARCHAR(5) NOT NULL,
    days_of_week JSON NOT NULL,
    themes JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
  )`,

  // WhatsApp Messages table
  `CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id VARCHAR(36) PRIMARY KEY,
    contact_id VARCHAR(36) NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    message LONGTEXT NOT NULL,
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_id (contact_id),
    INDEX idx_timestamp (timestamp)
  )`,

  // Preferences table
  `CREATE TABLE IF NOT EXISTS preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    theme ENUM('light', 'dark') DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'pt-BR',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
  )`,
]

try {
  for (const migration of migrations) {
    console.log('📝 Executando migração...')
    await connection.execute(migration)
    console.log('✅ Migração executada com sucesso')
  }

  console.log('\n✅ Todas as tabelas foram criadas com sucesso!')
  process.exit(0)
} catch (error) {
  console.error('❌ Erro ao executar migração:', error)
  process.exit(1)
} finally {
  await connection.end()
}
