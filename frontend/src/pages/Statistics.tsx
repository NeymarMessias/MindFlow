import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { apiClient } from '../services/api'
import { LogOut, Users, MessageSquare, TrendingUp } from 'lucide-react'

interface Stats {
  totalContacts: number
  activeContacts: number
  totalMessages: number
  contactsByStatus: { active: number; paused: number; unsubscribed: number }
  messagesByStatus: { sent: number; delivered: number; failed: number }
}

export function Statistics() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/stats/user')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e27' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a1f3a', borderBottom: '1px solid #2d3561', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Estatísticas</h2>
          <p style={{ color: '#8b92b8', margin: 0 }}>Acompanhe o desempenho de sua plataforma</p>
        </div>

        {loading ? (
          <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Carregando estatísticas...</div>
        ) : stats ? (
          <div>
            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#ff6b35', padding: '10px', borderRadius: '6px' }}>
                    <Users size={20} color="#fff" />
                  </div>
                  <span style={{ color: '#8b92b8', fontSize: '14px' }}>Total de Contatos</span>
                </div>
                <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{stats.totalContacts}</p>
              </div>

              <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#00d4ff', padding: '10px', borderRadius: '6px' }}>
                    <TrendingUp size={20} color="#fff" />
                  </div>
                  <span style={{ color: '#8b92b8', fontSize: '14px' }}>Contatos Ativos</span>
                </div>
                <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{stats.activeContacts}</p>
              </div>

              <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#ffd700', padding: '10px', borderRadius: '6px' }}>
                    <MessageSquare size={20} color="#fff" />
                  </div>
                  <span style={{ color: '#8b92b8', fontSize: '14px' }}>Total de Mensagens</span>
                </div>
                <p style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{stats.totalMessages}</p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Contatos por Status */}
              <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>Contatos por Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Ativos</span>
                      <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>{stats.contactsByStatus.active}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#00d4ff',
                          height: '100%',
                          width: `${stats.totalContacts > 0 ? (stats.contactsByStatus.active / stats.totalContacts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Pausados</span>
                      <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: 'bold' }}>{stats.contactsByStatus.paused}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#ff6b35',
                          height: '100%',
                          width: `${stats.totalContacts > 0 ? (stats.contactsByStatus.paused / stats.totalContacts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Desinscritos</span>
                      <span style={{ color: '#ff0000', fontSize: '14px', fontWeight: 'bold' }}>{stats.contactsByStatus.unsubscribed}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#ff0000',
                          height: '100%',
                          width: `${stats.totalContacts > 0 ? (stats.contactsByStatus.unsubscribed / stats.totalContacts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagens por Status */}
              <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>Mensagens por Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Enviadas</span>
                      <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>{stats.messagesByStatus.sent}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#00d4ff',
                          height: '100%',
                          width: `${stats.totalMessages > 0 ? (stats.messagesByStatus.sent / stats.totalMessages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Entregues</span>
                      <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>{stats.messagesByStatus.delivered}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#00ff00',
                          height: '100%',
                          width: `${stats.totalMessages > 0 ? (stats.messagesByStatus.delivered / stats.totalMessages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#8b92b8', fontSize: '14px' }}>Falhadas</span>
                      <span style={{ color: '#ff0000', fontSize: '14px', fontWeight: 'bold' }}>{stats.messagesByStatus.failed}</span>
                    </div>
                    <div style={{ backgroundColor: '#2d3561', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#ff0000',
                          height: '100%',
                          width: `${stats.totalMessages > 0 ? (stats.messagesByStatus.failed / stats.totalMessages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Erro ao carregar estatísticas</div>
        )}
      </div>
    </div>
  )
}
