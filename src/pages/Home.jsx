import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/HeroSection.jsx'
import ServicesSection from '../components/ServicesSection.jsx'
import FeaturedVehiclesSection from '../components/FeaturedVehiclesSection.jsx'
import SalesOfTheMonthSection from '../components/SalesOfTheMonthSection.jsx'
import DealerTeamSection from '../components/DealerTeamSection.jsx'
import WarningNoticeSection from '../components/WarningNoticeSection.jsx'
import GoogleReviewsEmbed from '../components/GoogleReviewsEmbed.jsx'
import SunnyAssistantSection from '../components/SunnyAssistantSection.jsx'
import NewsSection from '../components/NewsSection.jsx'

export default function Home({ onOpenAiChat }) {
  const navigate = useNavigate()
  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace('#', '')
        const elem = document.getElementById(id)
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    if (window.location.hash) {
      const timer = setTimeout(scrollToHash, 250)
      window.addEventListener('hashchange', scrollToHash)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('hashchange', scrollToHash)
      }
    }

    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  const handleSelectService = () => {
    const elem = document.getElementById('layanan')
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSelectEmergency = () => {
    if (onOpenAiChat) {
      onOpenAiChat({
        id: 'emergency',
        title: 'Bantuan Darurat 24/7 (SOS)',
      })
    }
  }

  const handleSelectTrust = () => {
    navigate('/organization')
  }

  const handleSelectSunny = () => {
    const elem = document.getElementById('sunny-assistant')
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    } else if (onOpenAiChat) {
      onOpenAiChat({
        id: 'sunny_consult',
        title: 'Konsultasi Asisten Sunny 24 Jam',
      })
    }
  }

  return (
    <div className="landing-page-flow">
      {/* SECTION 1: HERO SECTION */}
      <HeroSection
        onSelectService={handleSelectService}
        onSelectEmergency={handleSelectEmergency}
        onSelectTrust={handleSelectTrust}
        onSelectSunny={handleSelectSunny}
      />

      {/* SECTION 2: JELAJAH LAYANAN */}
      <ServicesSection
        onOpenAiWithService={(service) => {
          if (onOpenAiChat) onOpenAiChat(service)
        }}
      />

      {/* SECTION 3: 3 UNIT VARIAN UTAMA (KENDARAAN & PRICELIST) */}
      <FeaturedVehiclesSection
        onSelectTestDrive={(vehicle) => {
          if (onOpenAiChat) {
            onOpenAiChat({
              id: 'test_drive',
              title: `Jadwal Test Drive: ${vehicle.name} (${vehicle.priceFormatted})`,
            })
          }
        }}
      />

      {/* SECTION 4: SALES OF THE MONTH (HALL OF FAME PELAYANAN) */}
      <SalesOfTheMonthSection
        onConsultAiWithSales={(sales) => {
          if (onOpenAiChat) {
            onOpenAiChat({
              id: 'sales_consult',
              title: `Konsultasi Resmi dengan ${sales.name} (${sales.specialization})`,
            })
          }
        }}
      />

      {/* SECTION 5: TIM DEALER (THE TEAM SHOWCASE) */}
      <DealerTeamSection />

      {/* SECTION 6: PERINGATAN RESMI / ANTI-FRAUD WARNING SECTION */}
      <WarningNoticeSection />

      {/* GOOGLE REVIEWS EMBED SECTION */}
      <GoogleReviewsEmbed />

      {/* SECTION 7: SUNNY VIRTUAL ASSISTANT (SHOWCASE & MASKOT RESMI) */}
      <SunnyAssistantSection
        onOpenAiChat={(topic) => {
          if (onOpenAiChat) onOpenAiChat(topic)
        }}
      />

      {/* SECTION 8: NEWS & UPDATE (ARTIKEL & PUBLIKASI RESMI DEALER) */}
      <NewsSection />
    </div>
  )
}

