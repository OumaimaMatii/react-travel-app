import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import api from '../../services/api'

export default function ActiviteForm({ initial, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: initial || {} })
  const [destinations, setDestinations] = useState([])

  useEffect(() => {
    api.get('/destinations')
      .then(r => setDestinations((r.data?.data || r.data || []).map(d => ({ value: d.id, label: d.nom }))))
      .catch(() => {})
    if (initial) reset({ ...initial, destination_id: String(initial.destination_id || '') })
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nom de l'activité" {...register('nom', { required: 'Requis' })} error={errors.nom?.message} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={3} className="input-field" {...register('description')} placeholder="Description…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Prix (DH)" type="number" step="0.01" {...register('prix', { required: 'Requis' })} error={errors.prix?.message} />
        <Select label="Destination" options={destinations} placeholder="Choisir…"
          {...register('destination_id', { required: 'Requis' })} error={errors.destination_id?.message} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="adapte" {...register('adapte_enfants')} className="w-4 h-4 text-secondary rounded" />
        <label htmlFor="adapte" className="text-sm font-medium text-gray-700">Adapté aux enfants</label>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {initial ? 'Mettre à jour' : 'Créer l\'activité'}
      </Button>
    </form>
  )
}
