import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [academy, setAcademy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let resolved = false

    // Fallback: se nenhum dos dois resolver em 10s, libera o loading
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth timeout: forçando loading=false')
        setLoading(false)
      }
    }, 10000)

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        resolved = true
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('getSession error:', err)
        resolved = true
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        resolved = true
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setAcademy(null)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, academies(*)')
        .eq('id', userId)
        .single()

      if (profileData) {
        setProfile(profileData)
        setAcademy(profileData.academies)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, fullName, academyName, whatsapp }) {
    const academyId = crypto.randomUUID()

    // 1. Create the academy without .select() to avoid RLS error before auth is ready
    const { error: academyError } = await supabase
      .from('academies')
      .insert({
        id: academyId,
        name: academyName,
        responsible: fullName,
        whatsapp: whatsapp || '',
        email,
      })

    if (academyError) throw academyError

    // 2. Sign up the user (trigger handle_new_user links academy_id and sets role)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName, 
          academy_id: academyId 
        },
      },
    })

    if (authError) throw authError

    // 3. Setup default agents via edge function
    if (authData.user) {
      await supabase.functions.invoke('setup-academy', {
        body: { academy_id: academyId },
      })
    }

    const academyData = { id: academyId, name: academyName }
    return { user: authData.user, academy: academyData }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setAcademy(null)
  }

  const value = {
    user,
    profile,
    academy,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
