import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-display font-bold text-xl mb-3">
              Trip<span className="text-secondary">ify</span>
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Votre agence de voyage de confiance pour découvrir le Maroc et le monde entier.
            </p>
          </div>
          {/* Liens */}
          <div>
            <p className="font-semibold text-sm mb-4">Navigation</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/forfaits" className="hover:text-white transition-colors">Forfaits</Link></li>
              <li><Link to="/client/sur-mesure" className="hover:text-white transition-colors">Voyage sur mesure</Link></li>
              <li><Link to="/login"    className="hover:text-white transition-colors">Mon espace</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <p className="font-semibold text-sm mb-4">Contact</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><MapPin size={14} /> Rabat, Maroc</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +212 5XX XX XX XX</li>
              <li className="flex items-center gap-2"><Mail size={14} /> contact@voyagemaroc.ma</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Tripify. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
