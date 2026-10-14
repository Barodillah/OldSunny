import { useState } from 'react'
import HeroSection from '../components/HeroSection.jsx'
import ServicesSection from '../components/ServicesSection.jsx'
import FeaturedVehiclesSection from '../components/FeaturedVehiclesSection.jsx'
import AIAssistantFloating from '../components/AIAssistantFloating.jsx'

export default function Home() {
  const [selectedAiService, setSelectedAiService] = useState(null)

  const handleSelectService = () => {
    const elem = document.getElementById('layanan')
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSelectEmergency = () => {
    setSelectedAiService({
      id: 'emergency',
      title: 'Bantuan Darurat 24/7 (SOS)',
    })
  }

  const handleSelectTrust = () => {
    setSelectedAiService({
      id: 'trust',
      title: 'Verifikasi Struktur Organisasi & Anti-Oknum',
    })
  }

  return (
    <div className="landing-page-flow">
      {/* SECTION 1: HERO SECTION */}
      <HeroSection
        onSelectService={handleSelectService}
        onSelectEmergency={handleSelectEmergency}
        onSelectTrust={handleSelectTrust}
      />

      {/* SECTION 2: JELAJAH LAYANAN */}
      <ServicesSection
        onOpenAiWithService={(service) => setSelectedAiService(service)}
      />

      {/* SECTION 3: 3 UNIT VARIAN UTAMA (KENDARAAN & PRICELIST) */}
      <FeaturedVehiclesSection
        onSelectTestDrive={(vehicle) => {
          setSelectedAiService({
            id: 'test_drive',
            title: `Jadwal Test Drive: ${vehicle.name} (${vehicle.priceFormatted})`,
          })
        }}
      />

      {/* FLOATING RETRO AI COMPANION (SUNNY) */}
      <AIAssistantFloating
        prefilledAction={selectedAiService}
        onClosePrefill={() => setSelectedAiService(null)}
      />
    </div>
  )
}
