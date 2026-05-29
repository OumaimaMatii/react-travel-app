import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Headphones, Award, MapPin, Star, ChevronDown } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import ForfaitCard from '../../components/cards/ForfaitCard'
import DestinationCard from '../../components/cards/DestinationCard'
import api from '../../services/api'


import heroBg from './images/hero.avif'

export default function HomePage() {
  const [forfaits,     setForfaits]     = useState([])
  const [destinations, setDestinations] = useState([])

  useEffect(() => {
    api.get('/forfaits')
      .then(r => setForfaits((r.data?.data || r.data || []).slice(0, 3)))
      .catch(() => {})
    api.get('/destinations')
      .then(r => setDestinations((r.data?.data || r.data || []).filter(d => d.actif).slice(0, 4)))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <Header transparent />

      {/* Section Hero avec image locale */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-primary"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4">
            Explorez le monde avec nous
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Découvrez le Maroc<br />
            <span className="text-secondary">autrement</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Des voyages sur mesure et des forfaits inoubliables pour explorer les merveilles du Maroc et du monde entier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/client/sur-mesure"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-full font-semibold hover:bg-secondary-dark transition-all duration-200 shadow-lg">
              Créer mon voyage <ArrowRight size={18} />
            </Link>
            <Link to="/forfaits"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur text-white rounded-full font-semibold border border-white/30 hover:bg-white/25 transition-all duration-200">
              Voir les forfaits
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '500+', label: 'Voyages organisés' },
              { value: '98%',  label: 'Clients satisfaits' },
              { value: '50+',  label: 'Destinations' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-display font-bold text-primary">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Destinations populaires */}
      {destinations.length > 0 && (
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Où partir ?</p>
                <h2 className="font-display text-4xl font-bold text-primary">Destinations populaires</h2>
              </div>
              <Link to="/forfaits" className="hidden md:flex items-center gap-1 text-secondary font-medium hover:gap-2 transition-all text-sm">
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map(d => <DestinationCard key={d.id} destination={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* Section Forfaits populaires */}
      {forfaits.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Nos offres</p>
                <h2 className="font-display text-4xl font-bold text-primary">Voyages populaires</h2>
              </div>
              <Link to="/forfaits" className="hidden md:flex items-center gap-1 text-secondary font-medium hover:gap-2 transition-all text-sm">
                Tous les forfaits <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {forfaits.map(f => <ForfaitCard key={f.id} forfait={f} />)}
            </div>
          </div>
        </section>
      )}

      {/* Section CTA Voyage sur mesure */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=60)', backgroundSize: 'cover' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <p className="text-secondary font-semibold text-sm uppercase tracking-wide mb-3">Voyage personnalisé</p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Votre voyage, vos règles</h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Créez un voyage 100% personnalisé selon vos dates, votre budget et vos envies.
          </p>
          <Link to="/client/sur-mesure"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-full font-semibold hover:bg-secondary-dark transition-all">
            Créer mon voyage sur mesure <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Section Engagements */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Nos engagements</p>
            <h2 className="font-display text-4xl font-bold text-primary">Pourquoi choisir Tripify ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Voyage sécurisé', desc: 'Tous nos voyages sont assurés et encadrés par des professionnels certifiés.' },
              { icon: Headphones, title: 'Assistance 24/7', desc: 'Notre équipe est disponible à toute heure pour vous accompagner.' },
              { icon: Award, title: 'Meilleur prix garanti', desc: 'Nous négocions les meilleures offres pour un rapport qualité-prix imbattable.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8 text-center hover:shadow-card-hover transition-shadow">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={26} className="text-secondary" />
                </div>
                <h3 className="font-display font-bold text-lg text-primary mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}