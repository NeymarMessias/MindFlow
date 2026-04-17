import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { apiClient } from '../services/api'
import { LogOut, Plus, Trash2, Clock } from 'lucide-react'

interface Schedule {
  id: string
  contentId: string
  scheduledTime: string
  status: string
  createdAt: string
}

export function Schedules() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ contentId: '', scheduledTime: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [schedulesRes, contentsRes] = await Promise.all([
        apiClient.get('/schedules'),
        apiClient.get('/contents'),
      ])
      setSchedules(schedulesRes.data)
      setContents(contentsRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post('/schedules', formData)
      setFormData({ contentId: '', scheduledTime: '' })
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await apiClient.delete(`/schedules/${scheduleId}`)
        loadData()
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getContentTitle = (contentId: string) => {
    const content = contents.find((c) => c.id === contentId)
    return content ? content.title : 'Conteúdo não encontrado'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Agendamentos</h2>
            <p style={{ color: '#8b92b8', margin: 0 }}>Agende conteúdos para seus clientes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ff6b35',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
            <form onSubmit={handleCreateSchedule}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <select
                  value={formData.contentId}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  required
                  style={{
                    backgroundColor: '#0a0e27',
                    border: '1px solid #2d3561',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Selecione um conteúdo</option>
                  {contents.map((content) => (
                    <option key={content.id} value={content.id}>
                      {content.title}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                  style={{
                    backgroundColor: '#0a0e27',
                    border: '1px solid #2d3561',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Agendar
              </button>
            </form>
          </div>
        )}

        {/* Schedules Table */}
        {loading ? (
          <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Carregando agendamentos...</div>
        ) : schedules.length === 0 ? (
          <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Nenhum agendamento criado ainda</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2d3561' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Conteúdo</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Data/Hora</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b92b8', fontWeight: 'bold' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} style={{ borderBottom: '1px solid #2d3561' }}>
                    <td style={{ padding: '12px', color: '#fff' }}>{getContentTitle(schedule.contentId)}</td>
                    <td style={{ padding: '12px', color: '#8b92b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} />
                        {new Date(schedule.scheduledTime).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#fff' }}>
                      <span
                        style={{
                          backgroundColor: schedule.status === 'pending' ? '#ff6b35' : schedule.status === 'sent' ? '#00d4ff' : '#ff6b35',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {schedule.status === 'pending' ? 'Pendente' : schedule.status === 'sent' ? 'Enviado' : 'Erro'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #ff6b35',
                          color: '#ff6b35',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
