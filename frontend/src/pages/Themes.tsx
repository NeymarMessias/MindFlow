import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Plus, Trash2, Menu, X, LogOut } from 'lucide-react'

interface Theme {
  id: string
  name: string
  description: string
  isDefault: boolean
  isActive: boolean
}

export default function Themes() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewThemeForm, setShowNewThemeForm] = useState(false)
  const [newThemeName, setNewThemeName] = useState('')
  const [newThemeDescription, setNewThemeDescription] = useState('')
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
  }, [])

  const loadThemes = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/themes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Initialize default themes if not exists
        const initResponse = await fetch(
          'https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/themes/init-defaults',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const initData = await initResponse.json()
        setThemes(initData.data || [])
      } else {
        const data = await response.json()
        setThemes(data.data || [])
      }
    } catch (error) {
      console.error('Error loading themes:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar temas' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newThemeName.trim()) {
      setMessage({ type: 'error', text: 'Nome do tema é obrigatório' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newThemeName,
          description: newThemeDescription,
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar tema')

      const data = await response.json()
      setThemes([...themes, data.data])
      setNewThemeName('')
      setNewThemeDescription('')
      setShowNewThemeForm(false)
      setMessage({ type: 'success', text: 'Tema criado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error creating theme:', error)
      setMessage({ type: 'error', text: 'Erro ao criar tema' })
    }
  }

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este tema?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/themes/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao deletar tema')

      setThemes(themes.filter((t) => t.id !== id))
      setMessage({ type: 'success', text: 'Tema deletado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting theme:', error)
      setMessage({ type: 'error', text: 'Erro ao deletar tema' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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
                  backgroundColor: item.path === '/themes' ? '#ff6b35' : 'transparent',
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
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Temas</h2>
              <p style={{ color: '#8b92b8', margin: 0 }}>Gerencie os temas para geração de conteúdo</p>
            </div>
            <button
              onClick={() => setShowNewThemeForm(!showNewThemeForm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              <Plus size={18} />
              Novo Tema
            </button>
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

          {showNewThemeForm && (
            <form
              onSubmit={handleCreateTheme}
              style={{
                backgroundColor: '#1a1f3a',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px',
                border: '1px solid #2d3561',
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Nome do Tema
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Ex: Marketing Digital"
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#8b92b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Descrição
                </label>
                <textarea
                  value={newThemeDescription}
                  onChange={(e) => setNewThemeDescription(e.target.value)}
                  placeholder="Descrição do tema..."
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
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#ff6b35',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Criar Tema
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewThemeForm(false)}
                  style={{
                    backgroundColor: '#2d3561',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Carregando temas...</div>
          ) : themes.length === 0 ? (
            <div style={{ color: '#8b92b8', textAlign: 'center', padding: '40px' }}>Nenhum tema encontrado</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  style={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3561',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{theme.name}</h3>
                      {theme.isDefault && (
                        <span
                          style={{
                            backgroundColor: '#00d4ff',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          Padrão
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#8b92b8', margin: '0 0 10px 0', fontSize: '14px' }}>{theme.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!theme.isDefault && (
                      <>
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          style={{
                            flex: 1,
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Trash2 size={16} />
                          Deletar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
