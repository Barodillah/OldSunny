import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays
} from 'react-icons/hi2'
import { RiSteering2Line, RiCarLine } from 'react-icons/ri'
import TestDriveModal from './TestDriveModal.jsx'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format IDR
const formatIDR = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const PASSENGER_NAMES = {
  new_xforce: { name: 'NEW XFORCE' },
  destinator: { name: 'DESTINATOR' },
  new_xpander_cross: { name: 'NEW XPANDER CROSS' },
  new_xpander: { name: 'NEW XPANDER' },
  new_pajero_sport: { name: 'NEW PAJERO SPORT' },
  triton: { name: 'ALL NEW TRITON' },
  l300: { name: 'COLT L300' }
}

const DEFAULT_FEATURED_VEHICLES = [
  {
    id: 'new_xforce',
    name: 'NEW XFORCE',
    priceFormatted: 'Rp 388.000.000',
    imageUrl: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png',
  },
  {
    id: 'destinator',
    name: 'DESTINATOR',
    priceFormatted: 'Rp 402.000.000',
    imageUrl: 'https://csdwindo.com/media/mmksi/destinator.png',
  },
  {
    id: 'new_xpander_cross',
    name: 'NEW XPANDER CROSS',
    priceFormatted: 'Rp 348.000.000',
    imageUrl: 'https://csdwindo.com/media/mmksi/xpander_cross.webp',
  },
]

export default function FeaturedVehiclesSection({ onSelectTestDrive }) {
  const [vehicles, setVehicles] = useState(DEFAULT_FEATURED_VEHICLES)
  const [activeModalVehicle, setActiveModalVehicle] = useState(null)

  // Fetch dynamic price list & 3 featured models from Knowledge API
  useEffect(() => {
    fetch(`${API_BASE_URL}/knowledge/price-list`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data
          const fModels = Array.isArray(d.featured_models) && d.featured_models.length === 3
            ? d.featured_models
            : (d.meta?.featured_models || [])

          const pCars = d.passenger_car || {}
          if (Array.isArray(fModels) && fModels.length === 3) {
            const mapped = fModels.map((key) => {
              const car = pCars[key] || {}
              const meta = PASSENGER_NAMES[key] || { name: key.toUpperCase().replace(/_/g, ' ') }
              const items = car.items || []
              const prices = items.map((i) => i.price).filter(Boolean)
              const minPrice = prices.length ? Math.min(...prices) : 0

              return {
                id: key,
                name: car.name || meta.name,
                priceFormatted: minPrice ? formatIDR(minPrice) : 'Harga Menyesuaikan',
                imageUrl: car.image || 'https://csdwindo.com/wp-content/uploads/newxforcetr.png',
                minPrice
              }
            })
            setVehicles(mapped)
          }
        }
      })
      .catch((err) => {
        // Silently keep default featured vehicles on network failure
      })
  }, [])

  const handleOpenTestDriveModal = (vehicle) => {
    setActiveModalVehicle(vehicle)
  }

  return (
    <section className="featured-vehicles-section" id="kendaraan">
      {/* Background Ambient Video (Muted, Autoplay, Loop, PlaysInline) */}
      <div className="featured-video-bg-wrap" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="featured-video-bg-media"
        >
          <source
            src="https://bewhy.id/wp-content/uploads/url_6acb321e18d7d3.92845255.mp4"
            type="video/mp4"
          />
        </video>
        <div className="featured-video-overlay" />
      </div>

      <div className="featured-vehicles-container">
        {/* Section Header */}
        <div className="featured-vehicles-header">
          <div className="featured-header-left">
            <h2 className="featured-vehicles-title">
              Pilihan Favorit
            </h2>
            <p className="featured-vehicles-desc">
              Pilihan varian resmi dengan harga transparan dan ketersediaan unit uji jalan siap diantar.
            </p>
          </div>

          <div className="featured-header-right">
            <Link to="/vehicles" className="explore-all-link" title="Jelajahi Semua Model">
              <span>Explore All</span>
              <HiOutlineArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3 Main Vehicles Grid (Clean & Focused) */}
        <div className="featured-vehicles-grid">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="vehicle-card">
              {/* Visual Showcase */}
              <div className="vehicle-visual-wrapper">
                <div className="vehicle-image-stage">
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="vehicle-img"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div className="vehicle-body">
                <div className="vehicle-heading-group">
                  <h3 className="vehicle-model-name">{vehicle.name}</h3>
                </div>

                {/* Minimal Price Box */}
                <div className="vehicle-price-box">
                  <span className="price-label">Mulai Dari</span>
                  <span className="price-amount">{vehicle.priceFormatted}</span>
                </div>

                {/* Single Focused CTA */}
                <div className="vehicle-actions-row">
                  <button
                    type="button"
                    className="btn-testdrive-primary"
                    onClick={() => handleOpenTestDriveModal(vehicle)}
                  >
                    <RiSteering2Line size={19} />
                    <span>Test Drive</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile-only Explore All Link Bar */}
        <div className="featured-mobile-explore-wrap">
          <Link to="/services" className="explore-all-btn-mobile">
            <RiCarLine size={18} />
            <span>Lihat Semua</span>
            <HiOutlineArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Test Drive Reservation Modal */}
      <TestDriveModal
        vehicle={activeModalVehicle}
        isOpen={Boolean(activeModalVehicle)}
        onClose={() => setActiveModalVehicle(null)}
        onSelectTestDrive={onSelectTestDrive}
        source="Website - Featured Vehicles Section"
      />
    </section>
  )
}
