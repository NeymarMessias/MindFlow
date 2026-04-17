import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Plus, Trash2, Menu, X, LogOut, Clock, Eye, Loader } from 'lucide-react'

interface Theme {
  id: string
  name: string
  description: string
}

interface Content {
  id: string
  themeId: string
  title: string
  content: string
  summary: string
  wordCount: number
  status: 'generated' | 'scheduled' | 'sent' | 'failed'
  scheduledFor: string | null
  sentAt: string | null
  createdAt: string
}

export default function Contents() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Clientes', icon: '👥', path: '/clients' },
    { label: 'Temas', icon: '🏷️', path: '/themes' },
    { label: 'Conteúdos', icon: '📝', path: '/contents' },
    { label: 'Enviar Mensagem', icon: '✉️', path: '/send-message' },
    { label: 'Estatísticas', icon: '📈', path: '/statistics' },
  ]

  useEffect(() => {
    loadThemes()
    loadContents()
  }, [])

  const loadThemes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/themes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setThemes(data.data || [])
        if (data.data && data.data.length > 0) {
          setSelectedTheme(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading themes:', error)
    }
  }

  const loadContents = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/content', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContents(data.data || [])
      }
    } catch (error) {
      console.error('Error loading contents:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar conteúdos' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!selectedTheme) {
      setMessage({ type: 'error', text: 'Selecione um tema' })
      return
    }

    try {
      setIsGenerating(true)
      const token = localStorage.getItem('token')
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          themeId: selectedTheme,
        }),
      })

      if (!response.ok) throw new Error('Erro ao gerar conteúdo')

      const data = await response.json()
      setContents([data.data, ...contents])
      setMessage({ type: 'success', text: '✅ Conteúdo gerado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error generating content:', error)
      setMessage({ type: 'error', text: 'Erro ao gerar conteúdo' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleContent = async () => {
    if (!selectedContent || !scheduleDate || !scheduleTime) {
      setMessage({ type: 'error', text: 'Preencha data e hora' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()

      const response = await fetch(
        `https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/content/${selectedContent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'scheduled',
            scheduledFor,
          }),
        }
      )

      if (!response.ok) throw new Error('Erro ao agendar')

      setContents(
        contents.map((c) =>
          c.id === selectedContent.id
            ? { ...c, status: 'scheduled', scheduledFor }
            : c
        )
      )
      setShowScheduleModal(false)
      setSelectedContent(null)
      setMessage({ type: 'success', text: '✅ Conteúdo agendado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error scheduling content:', error)
      setMessage({ type: 'error', text: 'Erro ao agendar conteúdo' })
    }
  }

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este conteúdo?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/content/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao deletar')

      setContents(contents.filter((c) => c.id !== id))
      setMessage({ type: 'success', text: '✅ Conteúdo deletado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting content:', error)
      setMessage({ type: 'error', text: 'Erro ao deletar conteúdo' })
    }
  }

  const handleSendNow = async (contentId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        'https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/immediate/send-all',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentId }),
        }
      )

      if (!response.ok) throw new Error('Erro ao enviar')

      const data = await response.json()
      setMessage({ type: 'success', text: `✅ Enviado para ${data.successCount} contatos!` })
      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, status: 'sent', sentAt: new Date().toISOString() } : c
        )
      )
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error sending now:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar conteúdo' })
    }
  }

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      setMessage({ type: 'error', text: 'Selecione uma classificação' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        'https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/immediate/feedback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contentId: selectedContent?.id,
            contactId: 'default-contact', // Será substituído com ID real do contato
            rating: feedbackRating,
            feedback: feedbackText,
          }),
        }
      )

      if (!response.ok) throw new Error('Erro ao enviar feedback')

      setMessage({ type: 'success', text: `⭐ Obrigado! Feedback de ${feedbackRating} estrelas registrado!` })
      setShowFeedbackModal(false)
      setFeedbackRating(0)
      setFeedbackText('')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar feedback' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return '#00d4ff'
      case 'scheduled':
        return '#fbbf24'
      case 'sent':
        return '#10b981'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated':
        return 'Gerado'
      case 'scheduled':
        return 'Agendado'
      case 'sent':
        return 'Enviado'
      case 'failed':
        return 'Falhou'
      default:
        return status
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e27', display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: showMenu ? '250px' : '0',
          backgroundColor: '#1a1f3a',
          borderRight: '1px solid #2d3561',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <div style={{ fontSize: '24px' }}>⚡</div>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>MindFlow</h1>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setShowMenu(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: item.path === '/contents' ? '#ff6b35' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: showMenu ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#1a1f3a', borderBottom: '1px solid #2d3561', padding: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '24px' }}>⚡</div>
              <h1 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>MindFlow</h1>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Conteúdos</h2>
            <p style={{ color: '#8b92b8', margin: 0 }}>Gere e gerencie conteúdos com IA</p>
          </div>

          {message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
                color: '#fff',
                border: `1px solid ${message.type === 'success' ? '#059669' : '#dc2626'}`,
              }}
            >
              {message.text}
            </div>
          )}

          {/* Generate Section */}
          <div
            style={{
              backgroundColor: '#1a1f3a',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px',
              border: '1px solid #2d3561',
            }}
          >
            <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Gerar Novo Conteúdo
            </h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Selecione um Tema
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0a0e27',
                    color: '#fff',
                    border: '1px solid #2d3561',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Escolha um tema...</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating || !selectedTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isGenerating ? '#6b7280' : '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Gerar Conteúdo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contents List */}
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Conteúdos Gerados
            </h3>

            {isLoading ? (
              <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Carregando conteúdos...</div>
            ) : contents.length === 0 ? (
              <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Nenhum conteúdo gerado ainda</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {contents.map((content) => (
                  <div
                    key={content.id}
                    style={{
                      backgroundColor: '#1a1f3a',
                      border: '1px solid #2d3561',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                        {content.title}
                      </h4>
                      <p style={{ color: '#8b92b8', margin: '0 0 8px 0', fontSize: '14px' }}>
                        {content.summary}
                      </p>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#6b7280' }}>
                        <span>📝 {content.wordCount} palavras</span>
                        <span>📅 {new Date(content.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span
                          style={{
                            backgroundColor: getStatusColor(content.status),
                            color: content.status === 'generated' ? '#000' : '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {getStatusLabel(content.status)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setSelectedContent(content)
                          setShowViewModal(true)
                        }}
                        style={{
                          backgroundColor: '#00d4ff',
                          color: '#000',
                          border: 'none',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 'bold',
                        }}
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                      {content.status === 'generated' && (
                        <button
                          onClick={() => {
                            setSelectedContent(content)
                            setShowScheduleModal(true)
                          }}
                          style={{
                            backgroundColor: '#fbbf24',
                            color: '#000',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 'bold',
                          }}
                        >
                          <Clock size={16} />
                          Agendar
                        </button>
                      )}
                      {content.status === 'scheduled' && (
                        <button
                          onClick={() => handleDeleteContent(content.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 'bold',
                          }}
                        >
                          <Trash2 size={16} />
                          Cancelar
                        </button>
                      )}
                      {content.status === 'generated' && (
                        <button
                          onClick={() => handleSendNow(content.id)}
                          style={{
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 'bold',
                          }}
                        >
                          ✉️ Enviar Agora
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedContent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowViewModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #2d3561',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                {selectedContent.title}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ color: '#8b92b8', marginBottom: '20px', fontSize: '14px' }}>
              <p>{selectedContent.summary}</p>
              <p>📝 {selectedContent.wordCount} palavras</p>
            </div>

            <div
              style={{
                backgroundColor: '#0a0e27',
                padding: '20px',
                borderRadius: '8px',
                color: '#e5e7eb',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {selectedContent.content}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#2d3561',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedContent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              border: '1px solid #2d3561',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                Agendar Envio
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Data
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0e27',
                  color: '#fff',
                  border: '1px solid #2d3561',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Hora
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0e27',
                  color: '#fff',
                  border: '1px solid #2d3561',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleScheduleContent}
                style={{
                  flex: 1,
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Clock size={16} />
                Agendar
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#2d3561',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedContent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              border: '1px solid #2d3561',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                Avaliar Conteúdo
              </h2>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#8b92b8', marginBottom: '15px' }}>
                Como você avalia este conteúdo?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      fontSize: '32px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: feedbackRating >= star ? 1 : 0.3,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Comentário (opcional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Deixe seu feedback..."
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0e27',
                  color: '#fff',
                  border: '1px solid #2d3561',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitFeedback}
                style={{
                  flex: 1,
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Enviar Avaliação
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#2d3561',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
