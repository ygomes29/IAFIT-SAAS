import { useState, useEffect } from 'react'
import {
  Building2, User, MessageCircle, Plug, Activity,
  Shield, Save, Loader2, CheckCircle2, XCircle
} from 'lucide-react'
import styles from './Settings.module.css'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
      {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      {toast.message}
    </div>
  )
}

export default function Settings() {
  const { academy, user } = useAuth()
  const [saving, setSaving] = useState(null) // which section is saving
  const [toast, setToast] = useState(null)
  const [integrationId, setIntegrationId] = useState(null)

  const [form, setForm] = useState({
    // Academia
    name: '',
    responsible: '',
    email: '',
    whatsapp: '',
    // EVO / W12
    evo_instance: '',
    evo_api_url: '',
    evo_api_key: '',
    w12_token: '',
    w12_branch_id: '',
    // n8n
    n8n_url: '',
    n8n_api_key: '',
    // OpenAI
    openai_api_key: '',
  })

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (!academy) return

    setForm(prev => ({
      ...prev,
      name: academy.name || '',
      responsible: academy.responsible || '',
      email: academy.email || '',
      whatsapp: academy.whatsapp || '',
    }))

    async function loadIntegrations() {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('academy_id', academy.id)
          .single()
        if (error) throw error
        if (data) {
          setIntegrationId(data.id)
          setForm(prev => ({
            ...prev,
            evo_instance: data.evo_instance || '',
            evo_api_url: data.evo_api_url || '',
            evo_api_key: data.evo_api_key || '',
            w12_token: data.w12_token || '',
            w12_branch_id: data.w12_branch_id || '',
            n8n_url: data.n8n_url || '',
            n8n_api_key: data.n8n_api_key || '',
            openai_api_key: data.openai_api_key || '',
          }))
        }
      } catch {
        // integrations may not exist yet
      }
    }

    loadIntegrations()
  }, [academy])

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  async function saveAcademy() {
    if (!academy?.id) return
    setSaving('academy')
    try {
      const { error } = await supabase
        .from('academies')
        .update({ name: form.name, responsible: form.responsible, email: form.email, whatsapp: form.whatsapp })
        .eq('id', academy.id)
      if (error) throw error
      showToast('Dados da academia salvos!')
    } catch (err) {
      showToast('Erro ao salvar: ' + err.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  function isHttpsUrl(str) {
    if (!str) return true // campo vazio é permitido
    try { return new URL(str).protocol === 'https:' } catch { return false }
  }

  async function saveIntegrations() {
    if (!academy?.id) return
    const urlFields = { 'URL Evolution API': form.evo_api_url, 'URL n8n': form.n8n_url }
    for (const [label, url] of Object.entries(urlFields)) {
      if (url && !isHttpsUrl(url)) {
        showToast(`${label} deve começar com https://`, 'error')
        return
      }
    }
    setSaving('integrations')
    try {
      const updates = {
        evo_instance: form.evo_instance,
        evo_api_url: form.evo_api_url,
        evo_api_key: form.evo_api_key,
        w12_token: form.w12_token,
        w12_branch_id: form.w12_branch_id,
        n8n_url: form.n8n_url,
        n8n_api_key: form.n8n_api_key,
        openai_api_key: form.openai_api_key,
      }
      const { error } = integrationId
        ? await supabase.from('integrations').update(updates).eq('id', integrationId).eq('academy_id', academy.id)
        : await supabase.from('integrations').insert({ ...updates, academy_id: academy.id })
      if (error) throw error
      showToast('Integrações salvas!')
    } catch (err) {
      showToast('Erro ao salvar: ' + err.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className={styles.page}>
      <Toast toast={toast} />

      <div className={styles.header}>
        <h2 className={styles.title}>Configurações</h2>
        <p className={styles.subtitle}>Gerencie dados da academia, credenciais e integrações.</p>
      </div>

      <div className={styles.sections}>

        {/* Academia */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Building2 size={18} /></div>
            <h3 className={styles.sectionTitle}>Dados da Academia</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Nome da academia</label>
              <input className={styles.input} value={form.name} onChange={set('name')} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Responsável</label>
              <input className={styles.input} value={form.responsible} onChange={set('responsible')} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>E-mail</label>
              <input className={styles.input} type="email" value={form.email} onChange={set('email')} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>WhatsApp</label>
              <input className={styles.input} value={form.whatsapp} onChange={set('whatsapp')} placeholder="5531999001001" />
            </div>
          </div>
          <div className={styles.sectionSave}>
            <button className={styles.saveBtn} onClick={saveAcademy} disabled={saving === 'academy'}>
              {saving === 'academy'
                ? <><Loader2 size={15} className={styles.spinning} /> Salvando...</>
                : <><Save size={15} /> Salvar dados</>}
            </button>
          </div>
        </div>

        {/* Evolution API */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><MessageCircle size={18} /></div>
            <h3 className={styles.sectionTitle}>Evolution API (WhatsApp)</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Nome da instância</label>
              <input className={styles.input} value={form.evo_instance} onChange={set('evo_instance')} placeholder="conceito-fit" />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>URL da API</label>
              <input className={styles.input} value={form.evo_api_url} onChange={set('evo_api_url')} placeholder="https://evo.seudominio.com" />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>API Key</label>
              <input className={styles.input} type="password" value={form.evo_api_key} onChange={set('evo_api_key')} placeholder="••••••••••••••••" />
            </div>
          </div>
        </div>

        {/* W12 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Plug size={18} /></div>
            <h3 className={styles.sectionTitle}>W12 (ERP Academia)</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Token W12</label>
              <input className={styles.input} type="password" value={form.w12_token} onChange={set('w12_token')} placeholder="••••••••••••••••" />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>ID da Filial</label>
              <input className={styles.input} value={form.w12_branch_id} onChange={set('w12_branch_id')} placeholder="12345" />
            </div>
          </div>
        </div>

        {/* n8n */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Activity size={18} /></div>
            <h3 className={styles.sectionTitle}>n8n (Automação)</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>URL do n8n</label>
              <input className={styles.input} value={form.n8n_url} onChange={set('n8n_url')} placeholder="https://n8n.seudominio.com" />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>API Key</label>
              <input className={styles.input} type="password" value={form.n8n_api_key} onChange={set('n8n_api_key')} placeholder="••••••••••••••••" />
            </div>
          </div>
        </div>

        {/* OpenAI */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><User size={18} /></div>
            <h3 className={styles.sectionTitle}>OpenAI (Maria Júlia)</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>API Key OpenAI</label>
              <input className={styles.input} type="password" value={form.openai_api_key} onChange={set('openai_api_key')} placeholder="sk-••••••••••••••••" />
            </div>
          </div>
          <div className={styles.sectionSave}>
            <button className={styles.saveBtn} onClick={saveIntegrations} disabled={saving === 'integrations'}>
              {saving === 'integrations'
                ? <><Loader2 size={15} className={styles.spinning} /> Salvando...</>
                : <><Save size={15} /> Salvar integrações</>}
            </button>
          </div>
        </div>

        {/* Conta */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Shield size={18} /></div>
            <h3 className={styles.sectionTitle}>Conta</h3>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>E-mail</label>
              <input className={styles.input} value={user?.email || ''} disabled />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Função</label>
              <input className={styles.input} value="owner" disabled />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
