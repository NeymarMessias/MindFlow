import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { apiClient } from '../services/api'
import { LogOut, Users, MessageSquare, TrendingUp, Menu, X } from 'lucide-react'

interface Contact {
  id: string
  phoneNumber: string
  status: string
  messagesSent: number
  messagesRead: number
  createdAt: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/whatsapp/contacts')
      setContacts(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Clientes', icon: '👥', path: '/clients' },
    { label: 'Conteúdos', icon: '📝', path: '/contents' },
    { label: 'Agendamentos', icon: '⏰', path: '/schedules' },
    { label: 'Estatísticas', icon: '📈', path: '/statistics' },
  ]

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

        {/* Dashboard Content */}
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              Bem-vindo, {user?.name}!
            </h2>
            <p style={{ color: '#8b92b8', margin: 0 }}>Acompanhe o desempenho de sua plataforma</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ backgroundColor: '#ff6b35', padding: '10px', borderRadius: '6px' }}>
                  <Users size={20} color="#fff" />
                </div>
                <span style={{ color: '#8b92b8', fontSize: '14px' }}>Total de Contatos</span>
              </div>
              <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{contacts.length}</p>
            </div>

            <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ backgroundColor: '#00d4ff', padding: '10px', borderRadius: '6px' }}>
                  <TrendingUp size={20} color="#fff" />
                </div>
                <span style={{ color: '#8b92b8', fontSize: '14px' }}>Contatos Ativos</span>
              </div>
              <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>
                {contacts.filter((c) => c.status === 'active').length}
              </p>
            </div>

            <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ backgroundColor: '#ffd700', padding: '10px', borderRadius: '6px' }}>
                  <MessageSquare size={20} color="#fff" />
                </div>
                <span style={{ color: '#8b92b8', fontSize: '14px' }}>Mensagens Enviadas</span>
              </div>
              <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>
                {contacts.reduce((sum, c) => sum + (c.messagesSent || 0), 0)}
              </p>
            </div>
          </div>

          {/* Contacts Section */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0', fontWeight: 'bold' }}>Contatos WhatsApp</h3>
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
                Nenhum contato conectado ainda. Envie "Quero me conectar com o MindFlow" via WhatsApp para começar!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2d3561' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Número</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Mensagens Enviadas</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Mensagens Lidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} style={{ borderBottom: '1px solid #2d3561' }}>
                        <td style={{ padding: '12px', color: '#fff' }}>{contact.phoneNumber}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          <span
                            style={{
                              backgroundColor: contact.status === 'active' ? '#00d4ff' : '#ff6b35',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                            }}
                          >
                            {contact.status === 'active' ? 'Ativo' : 'Pausado'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#8b92b8' }}>{contact.messagesSent}</td>
                        <td style={{ padding: '12px', color: '#8b92b8' }}>{contact.messagesRead}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
