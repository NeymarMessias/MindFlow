import { logger } from '../utils/logger.js'
import { config } from '../config/config.js'

export class OpenAIService {
  private apiKey: string
  private apiUrl: string = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = config.openai.apiKey
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }
  }

  async generateContent(theme: string, previousTopics: string[] = []): Promise<{
    title: string
    content: string
    summary: string
    wordCount: number
  }> {
    try {
      const previousTopicsText = previousTopics.length > 0 
        ? `\n\nEvite repetir estes tópicos recentes:\n${previousTopics.join('\n')}` 
        : ''

      const prompt = `Você é um especialista em criar conteúdo educativo e engajante sobre ${theme}.

Crie um artigo ORIGINAL e VALIOSO sobre um aspecto interessante de ${theme} que seja relevante para profissionais e empreendedores.

${previousTopicsText}

IMPORTANTE:
- O conteúdo deve ter entre 800-1000 palavras
- Estrutura: Título atrativo, Introdução, 3-4 seções principais, Conclusão
- Inclua insights práticos e acionáveis
- Use linguagem clara e profissional
- Adicione exemplos reais quando possível
- Termine com uma chamada para ação

Formate a resposta EXATAMENTE assim:
TÍTULO: [Seu título aqui]
---
[Conteúdo completo aqui]
---
RESUMO: [Resumo de 1-2 linhas]`

      logger.info(`📡 Calling OpenAI API for theme: ${theme}`)

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        logger.error(`OpenAI API error (${response.status}):`, errorData)
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()

      // Parse response
      const responseText = data.choices[0].message.content || ''
      logger.info(`📝 Raw response from OpenAI (first 500 chars): ${responseText.substring(0, 500)}...`)
      
      const parts = responseText.split('---')
      logger.info(`🔍 Split parts count: ${parts.length}`)

      if (parts.length < 2) {
        logger.error(`❌ Invalid format. Expected at least 2 parts, got ${parts.length}. Response: ${responseText.substring(0, 300)}...`)
        throw new Error('Invalid response format from OpenAI')
      }

      const titleMatch = parts[0].match(/TÍTULO:\s*(.+)/)
      const title = titleMatch ? titleMatch[1].trim() : `Artigo sobre ${theme}`
      
      const content = parts[1].trim()
      
      let summary = ''
      if (parts.length >= 3) {
        const summaryMatch = parts[2].match(/RESUMO:\s*(.+)/s)
        summary = summaryMatch ? summaryMatch[1].trim().split('\n')[0] : ''
      }
      
      if (!summary) {
        const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0)
        summary = sentences.slice(0, 2).join('. ').substring(0, 200)
      }

      const wordCount = content.split(/\s+/).length

      logger.info(`✅ Content generated for theme "${theme}": ${title} (${wordCount} words)`)

      return {
        title,
        content,
        summary,
        wordCount,
      }
    } catch (error) {
      logger.error(`❌ Error generating content for theme "${theme}":`, error)
      throw error
    }
  }

  async generateMultipleContents(
    theme: string,
    count: number = 1,
    previousTopics: string[] = []
  ): Promise<Array<{ title: string; content: string; summary: string; wordCount: number }>> {
    const contents = []
    const newPreviousTopics = [...previousTopics]

    for (let i = 0; i < count; i++) {
      try {
        const content = await this.generateContent(theme, newPreviousTopics)
        contents.push(content)
        newPreviousTopics.push(content.title)
      } catch (error) {
        logger.error(`Error generating content ${i + 1}/${count}:`, error)
      }
    }

    return contents
  }
}

export const openaiService = new OpenAIService()
