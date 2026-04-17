import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  json,
  boolean,
  int,
  index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// Users Table
export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    userType: mysqlEnum('user_type', ['master', 'client']).default('client'),
    plan: mysqlEnum('plan', ['free', 'pro', 'enterprise']).default('free'),
    status: mysqlEnum('status', ['active', 'inactive', 'suspended']).default('active'),
    isProtected: boolean('is_protected').default(false),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    emailIdx: index('idx_email').on(table.email),
    statusIdx: index('idx_status').on(table.status),
    userTypeIdx: index('idx_user_type').on(table.userType),
  })
)

// WhatsApp Contacts Table
export const whatsappContacts = mysqlTable(
  'whatsapp_contacts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
    status: mysqlEnum('status', ['active', 'paused', 'unsubscribed']).default('active'),
    firstMessageAt: timestamp('first_message_at'),
    connectedAt: timestamp('connected_at'),
    lastMessageAt: timestamp('last_message_at'),
    preferredThemes: json('preferred_themes'),
    sendTime: varchar('send_time', { length: 5 }).default('07:00'),
    daysOfWeek: json('days_of_week').default(sql`'[1,2,3,4,5]'`),
    messagesSent: int('messages_sent').default(0),
    messagesRead: int('messages_read').default(0),
    messagesFailed: int('messages_failed').default(0),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    statusIdx: index('idx_status').on(table.status),
    phoneIdx: index('idx_phone').on(table.phoneNumber),
  })
)

// Contents Table
export const contents = mysqlTable(
  'contents',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    theme: mysqlEnum('theme', ['Tecnologia', 'Negócio', 'Marketing', 'Contabilidade']),
    status: mysqlEnum('status', ['generated', 'sent', 'approved', 'posted']).default('generated'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    themeIdx: index('idx_theme').on(table.theme),
    statusIdx: index('idx_status').on(table.status),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  })
)

// Schedules Table
export const schedules = mysqlTable(
  'schedules',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    contentId: varchar('content_id', { length: 36 }).notNull(),
    scheduledTime: timestamp('scheduled_time').notNull(),
    dayOfWeek: int('day_of_week'),
    isRecurring: boolean('is_recurring').default(false),
    status: mysqlEnum('status', ['pending', 'sent', 'failed', 'cancelled']).default('pending'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    contentIdIdx: index('idx_content_id').on(table.contentId),
    statusIdx: index('idx_status').on(table.status),
    scheduledTimeIdx: index('idx_scheduled_time').on(table.scheduledTime),
  })
)

// WhatsApp Messages Table
export const whatsappMessages = mysqlTable(
  'whatsapp_messages',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    contactId: varchar('contact_id', { length: 36 }).notNull(),
    direction: mysqlEnum('direction', ['inbound', 'outbound']).notNull(),
    message: text('message').notNull(),
    status: mysqlEnum('status', ['sent', 'delivered', 'read', 'failed']).default('sent'),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    contactIdIdx: index('idx_contact_id').on(table.contactId),
    timestampIdx: index('idx_timestamp').on(table.timestamp),
  })
)

// Content Themes Table
export const contentThemes = mysqlTable(
  'content_themes',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    isDefaultIdx: index('idx_is_default').on(table.isDefault),
    isActiveIdx: index('idx_is_active').on(table.isActive),
  })
)

// Generated Contents Table
export const generatedContents = mysqlTable(
  'generated_contents',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    themeId: varchar('theme_id', { length: 36 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    wordCount: int('word_count').default(0),
    status: mysqlEnum('status', ['generated', 'scheduled', 'sent', 'failed']).default('generated'),
    scheduledFor: timestamp('scheduled_for'),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    themeIdIdx: index('idx_theme_id').on(table.themeId),
    statusIdx: index('idx_status').on(table.status),
    scheduledForIdx: index('idx_scheduled_for').on(table.scheduledFor),
  })
)

// Preferences Table
export const preferences = mysqlTable(
  'preferences',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull().unique(),
    theme: mysqlEnum('theme', ['light', 'dark']).default('light'),
    language: varchar('language', { length: 10 }).default('pt-BR'),
    notificationsEnabled: boolean('notifications_enabled').default(true),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
  })
)
