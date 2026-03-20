import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, MessageSquare, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [academyName, setAcademyName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        await signUp({
          email,
          password,
          fullName,
          academyName,
          whatsapp,
        })
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        setIsSignUp(false)
      } else {
        await signIn({ email, password })
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}><Zap size={28} /></div>
            <div>
              <h1 className={styles.logoText}>IAFIT</h1>
              <span className={styles.logoSub}>Control</span>
            </div>
          </div>

          <h2 className={styles.headline}>
            O cockpit da sua academia.<br />
            <span className={styles.headlineAccent}>Controle total com IA.</span>
          </h2>

          <p className={styles.subheadline}>
            Ative seus agentes de vendas, retenção, cobrança e reativação.
            Acompanhe tudo em um painel executivo feito para donos de academia que querem resultado.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureDot} />
              <span>Resposta em 15 segundos — 24/7 no WhatsApp</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureDot} />
              <span>Cobrança elegante com PIX copia e cola</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureDot} />
              <span>Reativação de ex-alunos com campanhas cirúrgicas</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureDot} />
              <span>Redução de churn antes do cancelamento passivo</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              {isSignUp ? 'Criar conta' : 'Acessar plataforma'}
            </h3>
            <p className={styles.cardSub}>
              {isSignUp
                ? 'Cadastre sua academia para começar a operar com IA.'
                : 'Entre com suas credenciais para operar seus agentes de IA.'
              }
            </p>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {isSignUp && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="signup-name" className={styles.fieldLabel}>Seu nome</label>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="Ex: Carlos Mendes"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="signup-academy" className={styles.fieldLabel}>Nome da academia</label>
                    <input
                      id="signup-academy"
                      type="text"
                      placeholder="Ex: Arena Fitness Premium"
                      value={academyName}
                      onChange={e => setAcademyName(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="signup-whatsapp" className={styles.fieldLabel}>WhatsApp</label>
                    <input
                      id="signup-whatsapp"
                      type="tel"
                      placeholder="+55 11 99999-0000"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              <div className={styles.field}>
                <label htmlFor="login-email" className={styles.fieldLabel}>E-mail</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="login-password" className={styles.fieldLabel}>Senha</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : isSignUp ? (
                  <><UserPlus size={18} /> Criar conta</>
                ) : (
                  <><LogIn size={18} /> Entrar</>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button
              className={styles.diagBtn}
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
            >
              {isSignUp ? (
                <><LogIn size={18} /> Já tenho conta — Entrar</>
              ) : (
                <><UserPlus size={18} /> Criar conta gratuita</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
