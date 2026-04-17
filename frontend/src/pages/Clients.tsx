import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Menu, X, LogOut, Pause, Play, Trash2, Loader } from 'lucide-react'

interface Contact {
  id: string
  phoneNumber: string
  status: string
  messagesSent: number
  messagesRead: number
  createdAt: string
}

export function Clients() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/whatsapp/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Erro ao carregar contatos')

      const data = await response.json()
      setContacts(data.data || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseContact = async (contactId: string) => {
    setActionLoading(contactId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/whatsapp/contacts/${contactId}/pause`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Erro ao pausar contato')

      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: 'paused' } : c))
      )
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeContact = async (contactId: string) => {
    setActionLoading(contactId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/whatsapp/contacts/${contactId}/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Erro ao retomar contato')

      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: 'active' } : c))
      )
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnsubscribeContact = async (contactId: string) => {
    if (!confirm('Tem certeza que deseja desinscrever este contato?')) return

    setActionLoading(contactId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/whatsapp/contacts/${contactId}/unsubscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Erro ao desinscrever contato')

      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: 'unsubscribed' } : c))
      )
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Clientes', icon: '👥', path: '/clients' },
    { label: 'Enviar Mensagem', icon: '✉️', path: '/send-message' },
    { label: 'Conteúdos', icon: '📝', path: '/contents' },
    { label: 'Agendamentos', icon: '⏰', path: '/schedules' },
    { label: 'Estatísticas', icon: '📈', path: '/statistics' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00d4ff'
      case 'paused':
        return '#ffd700'
      case 'unsubscribed':
        return '#ff6b35'
      default:
        return '#8b92b8'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'paused':
        return 'Pausado'
      case 'unsubscribed':
        return 'Desinscritos'
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
                  backgroundColor: window.location.pathname === item.path ? '#ff6b35' : 'transparent',
                  color: window.location.pathname === item.path ? '#fff' : '#8b92b8',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ff6b35',
                cursor: 'pointer',
                fontSize: '24px',
              }}
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                navigate('/login')
              }}
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
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Gerenciar Clientes</h2>
            <p style={{ color: '#8b92b8', margin: 0 }}>Visualize e gerencie todos os seus contatos WhatsApp</p>
          </div>

          {/* Contacts Table */}
          {isLoading ? (
            <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Carregando contatos...</div>
          ) : contacts.length === 0 ? (
            <div
              style={{
                backgroundColor: '#1a1f3a',
                border: '1px solid #2d3561',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#8b92b8',
              }}
            >
              Nenhum contato conectado ainda.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d3561' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Número</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Mensagens</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Lidas</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} style={{ borderBottom: '1px solid #2d3561' }}>
                      <td style={{ padding: '12px', color: '#fff' }}>{contact.phoneNumber}</td>
                      <td style={{ padding: '12px', color: '#fff' }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(contact.status),
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {getStatusLabel(contact.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#8b92b8' }}>{contact.messagesSent}</td>
                      <td style={{ padding: '12px', color: '#8b92b8' }}>{contact.messagesRead}</td>
                      <td style={{ padding: '12px', color: '#fff' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {contact.status === 'active' ? (
                            <button
                              onClick={() => handlePauseContact(contact.id)}
                              disabled={actionLoading === contact.id}
                              style={{
                                backgroundColor: '#ffd700',
                                color: '#000',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: actionLoading === contact.id ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {actionLoading === contact.id ? <Loader size={14} /> : <Pause size={14} />}
                              Pausar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResumeContact(contact.id)}
                              disabled={actionLoading === contact.id}
                              style={{
                                backgroundColor: '#00d4ff',
                                color: '#000',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: actionLoading === contact.id ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {actionLoading === contact.id ? <Loader size={14} /> : <Play size={14} />}
                              Retomar
                            </button>
                          )}
                          <button
                            onClick={() => handleUnsubscribeContact(contact.id)}
                            disabled={actionLoading === contact.id}
                            style={{
                              backgroundColor: '#ff6b35',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: actionLoading === contact.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {actionLoading === contact.id ? <Loader size={14} /> : <Trash2 size={14} />}
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
