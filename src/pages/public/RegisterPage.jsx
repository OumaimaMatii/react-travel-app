import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [show, setShow] = useState(false)
  const [localErr, setLocalErr] = useState({})

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name)     errs.name     = 'Nom requis.'
    if (!form.email)    errs.email    = 'Email requis.'
    if (!form.password) errs.password = 'Mot de passe requis.'
    if (form.password.length < 8)     errs.password = 'Minimum 8 caractères.'
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Les mots de passe ne correspondent pas.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setLocalErr(errs); return }
    setLocalErr({})
    try {
      await dispatch(registerUser(form)).unwrap()
      navigate('/client')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-bold text-2xl text-primary">
            Trip<span className="text-secondary">ify</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Créez votre compte voyageur</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-display font-bold text-primary mb-6">Inscription</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {typeof error === 'string' ? error : error.message || 'Une erreur est survenue.'}
              {error.errors && (
                <ul className="mt-1 list-disc list-inside text-xs">
                  {Object.entries(error.errors).map(([k, v]) => <li key={k}>{v[0]}</li>)}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className={`input-field ${localErr.name ? 'border-danger' : ''}`} placeholder="Prénom NOM" />
              {localErr.name && <p className="text-xs text-danger mt-1">{localErr.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className={`input-field ${localErr.email ? 'border-danger' : ''}`} placeholder="vous@exemple.com" />
              {localErr.email && <p className="text-xs text-danger mt-1">{localErr.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className={`input-field pr-10 ${localErr.password ? 'border-danger' : ''}`} placeholder="Min. 8 caractères" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {localErr.password && <p className="text-xs text-danger mt-1">{localErr.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                className={`input-field ${localErr.password_confirmation ? 'border-danger' : ''}`} placeholder="••••••••" />
              {localErr.password_confirmation && <p className="text-xs text-danger mt-1">{localErr.password_confirmation}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-secondary font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
