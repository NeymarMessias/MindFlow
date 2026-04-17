import { db } from '../db/index'
import { users } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import bcryptjs from 'bcryptjs'
import { logger } from '../utils/logger'

export interface CreateClientInput {
  email: string
  password: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  masterUserId: string
}

export interface UpdateClientInput {
  name?: string
  plan?: 'free' | 'pro' | 'enterprise'
  status?: 'active' | 'paused' | 'suspended'
}

export class ClientService {
  /**
   * Criar novo cliente (apenas Master pode fazer isso)
   */
  async createClient(input: CreateClientInput) {
    try {
      // Verificar se email já existe
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)

      if (existingUser.length > 0) {
        throw new Error('Email já cadastrado')
      }

      // Hash da senha
      const hashedPassword = await bcryptjs.hash(input.password, 10)

      // Criar cliente
      const result = await db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          userType: 'client',
          plan: input.plan,
          status: 'active',
          isProtected: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      logger.info(`Cliente criado: ${input.email}`)

      return {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        plan: result[0].plan,
        status: result[0].status,
      }
    } catch (error) {
      logger.error(`Erro ao criar cliente: ${error}`)
      throw error
    }
  }

  /**
   * Listar todos os clientes
   */
  async listClients(masterUserId: string) {
    try {
      const clients = await db
        .select()
        .from(users)
        .where(and(eq(users.userType, 'client')))

      return clients.map((client: any) => ({
        id: client.id,
        email: client.email,
        name: client.name,
        plan: client.plan,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }))
    } catch (error) {
      logger.error(`Erro ao listar clientes: ${error}`)
      throw error
    }
  }

  /**
   * Obter cliente por ID
   */
  async getClient(clientId: string) {
    try {
      const client = await db
        .select()
        .from(users)
        .where(and(eq(users.id, clientId), eq(users.userType, 'client')))
        .limit(1)

      if (client.length === 0) {
        throw new Error('Cliente não encontrado')
      }

      return {
        id: client[0].id,
        email: client[0].email,
        name: client[0].name,
        plan: client[0].plan,
        status: client[0].status,
        createdAt: client[0].createdAt,
        updatedAt: client[0].updatedAt,
      }
    } catch (error) {
      logger.error(`Erro ao obter cliente: ${error}`)
      throw error
    }
  }

  /**
   * Atualizar cliente
   */
  async updateClient(clientId: string, input: UpdateClientInput) {
    try {
      const result = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, clientId), eq(users.userType, 'client')))
        .returning()

      if (result.length === 0) {
        throw new Error('Cliente não encontrado')
      }

      logger.info(`Cliente atualizado: ${clientId}`)

      return {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        plan: result[0].plan,
        status: result[0].status,
      }
    } catch (error) {
      logger.error(`Erro ao atualizar cliente: ${error}`)
      throw error
    }
  }

  /**
   * Deletar cliente (não pode deletar se estiver protegido)
   */
  async deleteClient(clientId: string) {
    try {
      // Verificar se cliente existe e não está protegido
      const client = await db
        .select()
        .from(users)
        .where(eq(users.id, clientId))
        .limit(1)

      if (client.length === 0) {
        throw new Error('Cliente não encontrado')
      }

      if (client[0].isProtected) {
        throw new Error('Não é possível deletar usuário protegido')
      }

      await db.delete(users).where(eq(users.id, clientId))

      logger.info(`Cliente deletado: ${clientId}`)

      return { success: true }
    } catch (error) {
      logger.error(`Erro ao deletar cliente: ${error}`)
      throw error
    }
  }

  /**
   * Pausar cliente
   */
  async pauseClient(clientId: string) {
    return this.updateClient(clientId, { status: 'paused' })
  }

  /**
   * Retomar cliente
   */
  async resumeClient(clientId: string) {
    return this.updateClient(clientId, { status: 'active' })
  }

  /**
   * Suspender cliente
   */
  async suspendClient(clientId: string) {
    return this.updateClient(clientId, { status: 'suspended' })
  }
}

export const clientService = new ClientService()
