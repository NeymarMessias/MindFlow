import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Send, Menu, X, LogOut, AlertCircle, CheckCircle } from 'lucide-react'

interface SendMessageState {
  phoneNumber: string
  message: string
  isSending: boolean
  success: boolean
  error: string
}

export default function SendMessage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [state, setState] = useState<SendMessageState>({
    phoneNumber: '',
    message: '',
    isSending: false,
    success: false,
    error: '',
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!state.phoneNumber || !state.message) {
      setState((prev) => ({ ...prev, error: 'Preencha todos os campos' }))
      return
    }

    setState((prev) => ({ ...prev, isSending: true, error: '', success: false }))

    try {
      const response = await fetch('https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: state.phoneNumber,
          message: state.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      setState((prev) => ({
        ...prev,
        success: true,
        phoneNumber: '',
        message: '',
        isSending: false,
      }))

      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }))
      }, 3000)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isSending: false,
      }))
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
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Enviar Mensagem</h2>
            <p style={{ color: '#8b92b8', margin: 0 }}>Envie uma mensagem via WhatsApp para um contato</p>
          </div>

          {/* Success Message */}
          {state.success && (
            <div
              style={{
                backgroundColor: '#1a3a1a',
                border: '1px solid #00d4ff',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle size={20} color="#00d4ff" />
              <span style={{ color: '#00d4ff' }}>Mensagem enviada com sucesso!</span>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <div
              style={{
                backgroundColor: '#3a1a1a',
                border: '1px solid #ff6b35',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertCircle size={20} color="#ff6b35" />
              <span style={{ color: '#ff6b35' }}>{state.error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendMessage}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#8b92b8', marginBottom: '8px', fontSize: '14px' }}>
                Número de Telefone
              </label>
              <input
                type="text"
                placeholder="Ex: 5533988421335"
                value={state.phoneNumber}
                onChange={(e) => setState((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #2d3561',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#8b92b8', marginBottom: '8px', fontSize: '14px' }}>
                Mensagem
              </label>
              <textarea
                placeholder="Digite sua mensagem aqui..."
                value={state.message}
                onChange={(e) => setState((prev) => ({ ...prev, message: e.target.value }))}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #2d3561',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={state.isSending}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: state.isSending ? '#666' : '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: state.isSending ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Send size={16} />
              {state.isSending ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>

          {/* Info Box */}
          <div
            style={{
              backgroundColor: '#1a1f3a',
              border: '1px solid #2d3561',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '30px',
            }}
          >
            <h4 style={{ color: '#fff', margin: '0 0 8px 0' }}>💡 Dica</h4>
            <p style={{ color: '#8b92b8', margin: 0, fontSize: '14px' }}>
              Use o formato internacional do número (ex: 5533988421335 para Brasil). A mensagem será enviada via WhatsApp através da UAZ API.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
