import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../services/api'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const response = await authApi.login(formData.email, formData.password)
        const { token, userId, email, name, plan } = response.data
        setToken(token)
        setUser({ userId, email, name, plan })
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard')
      } else {
        const response = await authApi.register(
          formData.email,
          formData.password,
          formData.name
        )
        const { token, userId, email, name, plan } = response.data
        setToken(token)
        setUser({ userId, email, name, plan })
        toast.success('Conta criada com sucesso!')
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao autenticar')
    } finally {
      setIsLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(20, 20, 35, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 107, 53, 0.2)',
      borderRadius: '12px',
      padding: '48px 32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      position: 'relative' as const,
      zIndex: 10,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '40px',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '20px',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#ffffff',
      margin: '0 0 8px 0',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#a0a0b0',
      margin: '8px 0 0 0',
      fontWeight: '400',
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.5), transparent)',
      margin: '24px 0',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#ffffff',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    input: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 107, 53, 0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ffffff',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      outline: 'none' as const,
    },
    button: {
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '13px',
      color: '#707080',
      borderTop: '1px solid rgba(255, 107, 53, 0.1)',
      paddingTop: '24px',
    },
    link: {
      color: '#ff6b35',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    powered: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '12px',
      color: '#505060',
    },
  }

  return (
    <div style={styles.container}>
      {/* Elementos decorativos */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(100, 200, 255, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <Zap size={24} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={styles.title}>MindFlow</h1>
          </div>
          <p style={styles.subtitle}>
            {isLogin ? 'Bem-vindo de volta' : 'Junte-se ao MindFlow'}
          </p>
          <p style={{ ...styles.subtitle, marginTop: '4px' }}>
            Treinamento Diário e Social Media
          </p>
          <div style={styles.divider} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                style={styles.input}
                placeholder="Seu nome"
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="seu@email.com"
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.6)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="••••••••"
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.6)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
          >
            {isLoading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div style={styles.footer}>
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <span
            style={styles.link}
            onClick={() => setIsLogin(!isLogin)}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f7931e')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#ff6b35')}
          >
            {isLogin ? 'Criar conta' : 'Entrar'}
          </span>
        </div>

        <div style={styles.powered}>
          <Zap size={12} color="#ff6b35" style={{ display: 'inline', marginRight: '4px' }} />
          Powered by AI & Technology
        </div>
      </div>
    </div>
  )
}
