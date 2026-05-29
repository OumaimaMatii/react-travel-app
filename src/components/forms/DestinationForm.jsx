import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import api from '../../services/api'

export default function DestinationForm({ initial, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: initial || {} })
  const [villes, setVilles] = useState([])

  useEffect(() => {
    api.get('/villes')
      .then(r => setVilles((r.data?.data || r.data || []).map(v => ({ value: v.id, label: v.nom }))))
      .catch(() => {})
    if (initial) reset({ ...initial, ville_id: String(initial.ville_id || '') })
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nom" {...register('nom', { required: 'Requis' })} error={errors.nom?.message} />
      <Input label="Pays" {...register('pays', { required: 'Requis' })} error={errors.pays?.message} />
      <Select label="Ville" options={villes} placeholder="Choisir…"
        {...register('ville_id', { required: 'Requis' })} error={errors.ville_id?.message} />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="actif" {...register('actif')} className="w-4 h-4 text-secondary rounded" />
        <label htmlFor="actif" className="text-sm font-medium text-gray-700">Active</label>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {initial ? 'Mettre à jour' : 'Créer la destination'}
      </Button>
    </form>
  )
}
