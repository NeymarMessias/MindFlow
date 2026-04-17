import { db } from '../db/index'
import { contents } from '../db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'

export interface CreateContentInput {
  title: string
  body: string
  imageUrl?: string
  type: 'text' | 'image' | 'video'
  channel: 'whatsapp' | 'instagram' | 'both'
  masterUserId: string
}

export interface UpdateContentInput {
  title?: string
  body?: string
  imageUrl?: string
  type?: 'text' | 'image' | 'video'
  channel?: 'whatsapp' | 'instagram' | 'both'
  status?: 'draft' | 'published' | 'archived'
}

export class ContentService {
  /**
   * Criar novo conteúdo
   */
  async createContent(input: CreateContentInput) {
    try {
      const result = await db
        .insert(contents)
        .values({
          title: input.title,
          body: input.body,
          imageUrl: input.imageUrl,
          type: input.type,
          channel: input.channel,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      logger.info(`Conteúdo criado: ${result[0].id}`)

      return {
        id: result[0].id,
        title: result[0].title,
        body: result[0].body,
        imageUrl: result[0].imageUrl,
        type: result[0].type,
        channel: result[0].channel,
        status: result[0].status,
        createdAt: result[0].createdAt,
      }
    } catch (error) {
      logger.error(`Erro ao criar conteúdo: ${error}`)
      throw error
    }
  }

  /**
   * Listar todos os conteúdos
   */
  async listContents() {
    try {
      const allContents = await db.select().from(contents)

      return allContents.map((content: any) => ({
        id: content.id,
        title: content.title,
        body: content.body,
        imageUrl: content.imageUrl,
        type: content.type,
        channel: content.channel,
        status: content.status,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      }))
    } catch (error) {
      logger.error(`Erro ao listar conteúdos: ${error}`)
      throw error
    }
  }

  /**
   * Obter conteúdo por ID
   */
  async getContent(contentId: string) {
    try {
      const content = await db
        .select()
        .from(contents)
        .where(eq(contents.id, contentId))
        .limit(1)

      if (content.length === 0) {
        throw new Error('Conteúdo não encontrado')
      }

      return {
        id: content[0].id,
        title: content[0].title,
        body: content[0].body,
        imageUrl: content[0].imageUrl,
        type: content[0].type,
        channel: content[0].channel,
        status: content[0].status,
        createdAt: content[0].createdAt,
        updatedAt: content[0].updatedAt,
      }
    } catch (error) {
      logger.error(`Erro ao obter conteúdo: ${error}`)
      throw error
    }
  }

  /**
   * Atualizar conteúdo
   */
  async updateContent(contentId: string, input: UpdateContentInput) {
    try {
      const result = await db
        .update(contents)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(contents.id, contentId))
        .returning()

      if (result.length === 0) {
        throw new Error('Conteúdo não encontrado')
      }

      logger.info(`Conteúdo atualizado: ${contentId}`)

      return {
        id: result[0].id,
        title: result[0].title,
        body: result[0].body,
        imageUrl: result[0].imageUrl,
        type: result[0].type,
        channel: result[0].channel,
        status: result[0].status,
      }
    } catch (error) {
      logger.error(`Erro ao atualizar conteúdo: ${error}`)
      throw error
    }
  }

  /**
   * Deletar conteúdo
   */
  async deleteContent(contentId: string) {
    try {
      await db.delete(contents).where(eq(contents.id, contentId))

      logger.info(`Conteúdo deletado: ${contentId}`)

      return { success: true }
    } catch (error) {
      logger.error(`Erro ao deletar conteúdo: ${error}`)
      throw error
    }
  }

  /**
   * Publicar conteúdo
   */
  async publishContent(contentId: string) {
    return this.updateContent(contentId, { status: 'published' })
  }

  /**
   * Arquivar conteúdo
   */
  async archiveContent(contentId: string) {
    return this.updateContent(contentId, { status: 'archived' })
  }
}

export const contentService = new ContentService()
