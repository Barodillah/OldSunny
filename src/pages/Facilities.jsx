import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronDown
} from 'react-icons/hi2'
import GoogleReviewsEmbed from '../components/GoogleReviewsEmbed.jsx'
import './Facilities.css'

const FACILITY_FAQS = [
  {
    id: 'faq-free',
    question: 'Apakah seluruh fasilitas ini gratis digunakan?',
    answer:
      'Ya, seluruh fasilitas seperti Shuttle Service, Voucher Noah Coffee, Kids Zone Playground, Snack Corner, dan area kerja Wi-Fi 6 dapat dinikmati 100% gratis oleh setiap pelanggan showroom dan bengkel resmi Sun Margahayu.'
  },
  {
    id: 'faq-shuttle',
    question: 'Bagaimana cara memesan layanan Shuttle Service?',
    answer:
      'Anda cukup menginformasikan rencana perjalanan Anda ke Service Advisor saat melakukan registrasi servis kendaraan, atau menanyakannya lebih awal ke Asisten AI Sunny. Staf kami akan menyiapkan pengemudi dan armada shuttle.'
  },
  {
    id: 'faq-hours',
    question: 'Berapa jam operasional Playground & Cafe Lounge?',
    answer:
      'Fasilitas ramah keluarga dan lounge buka setiap hari mengikuti jadwal operasional bengkel resmi Sun Margahayu, mulai pukul 08.00 hingga 17.00 WIB.'
  },
  {
    id: 'faq-work',
    question: 'Apakah ada area kerja yang tenang untuk meeting online?',
    answer:
      'Tersedia meja kerja Work From Anywhere yang nyaman dengan colokan listrik universal di setiap kursi, koneksi Wi-Fi 6 berkecepatan tinggi, dan pencahayaan yang mendukung produktivitas kerja Anda.'
  }
]

export default function Facilities({ onOpenAiChat }) {
  // Playground & Cafe gallery items
  const playgroundGallery = [
    {
      id: 'board-game',
      title: 'Board Game Interaktif',
      category: 'Hiburan Keluarga',
      badge: 'Zero Boredom',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98738024.77395649.jpeg',
      description:
        'Pilihan puluhan board game seru dan edukatif untuk dimainkan bersama keluarga atau kawan selagi menunggu kendaraan Anda selesai diperiksa.',
      highlights: ['Koleksi game strategi & keluarga', 'Bersih dan dirawat berkala', 'Bebas dimainkan sepuasnya'],
    },
    {
      id: 'kids-zone-1',
      title: 'Kids Zone',
      category: 'Arena Anak',
      badge: 'Aman & Bersih',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98731b62.64802432.jpeg',
      description:
        'Kids zone dengan matras pelindung benturan empuk, dirancang khusus untuk kenyamanan dan keceriaan si buah hati.',
      highlights: ['Lantai busa peredam empuk', 'Bola plastik food-grade higienis', 'Zona bermain luas & terbuka'],
    },
    {
      id: 'kids-zone-2',
      title: 'Wahana Bermain Anak Ramah Balita',
      category: 'Arena Anak',
      badge: 'Pantauan Mudah',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f9872f194.23454309.jpeg',
      description:
        'Area bermain anak yang diposisikan sejajar dengan barisan kursi tunggu orang tua, memudahkan Anda mengawasi si kecil sambil bersantai.',
      highlights: ['Visibilitas langsung dari sofa', 'Material tanpa sudut tajam', 'Sirkulasi udara sejuk'],
    },
    {
      id: 'kids-zone-3',
      title: 'Kids Zone Edukatif & Kreatif',
      category: 'Arena Anak',
      badge: 'Mainan Edukasi',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f9872ce45.99931321.jpeg',
      description:
        'Dilengkapi berbagai sarana motorik, balok susun interaktif, dan alat mewarnai yang merangsang daya imajinasi serta kreativitas anak.',
      highlights: ['Mainan bersertifikasi SNI', 'Dibersihkan setiap pagi & sore', 'Meja gambar khusus balita'],
    },
    {
      id: 'kids-zone-4',
      title: 'Wahana Bermain Bersih & Higienis',
      category: 'Arena Anak',
      badge: 'Disinfeksi Berkala',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f987255d1.93011250.jpeg',
      description:
        'Penerapan standar kebersihan ketat dengan protokol disinfeksi terjadwal, menjaga playground senantiasa higienis dan nyaman bagi setiap keluarga.',
      highlights: ['Penyemprotan disinfektan alami', 'Bebas debu & partikel kasar', 'Area tertutup ber-AC'],
    },
    {
      id: 'kids-zone-5',
      title: 'Kids Play Corner Eksklusif',
      category: 'Arena Anak',
      badge: 'Hospitalitas Anak',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98722822.51908344.jpeg',
      description:
        'Suasana ceria dengan dekorasi ramah anak yang membuat waktu tunggu servis tidak lagi membosankan bagi seluruh anggota keluarga.',
      highlights: ['Suasana menyenangkan', 'Bebas biaya tambahan', 'Didampingi kru hospitality'],
    },
    {
      id: 'enjoy-room',
      title: 'Enjoy Room dengan Bean Bag',
      category: 'Ruang Rileks',
      badge: 'Santai Maksimal',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98733817.96712561.jpeg',
      description:
        'Ruang rileks privat dengan jajaran bean bag ergonomis, pencahayaan hangat, dan atmosfer tenang untuk Anda yang ingin rebahan sejenak.',
      highlights: ['Bean bag ukuran jumbo empuk', 'Pencahayaan ramah mata', 'Suasana tenang tanpa bising'],
    },
    {
      id: 'work-from-anywhere',
      title: 'Tempat Work From Anywhere yang Nyaman',
      category: 'Ruang Produktif',
      badge: 'Wi-Fi 6 Cepat',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f9872a8a7.97772027.jpeg',
      description:
        'Meja kerja lapang yang dilengkapi stopkontak di setiap sudut, koneksi internet serat optik kecepatan tinggi, serta kursi duduk ergonomis.',
      highlights: ['Port charger universal & Type-C', 'Koneksi Wi-Fi stabil berkecepatan tinggi', 'Meja lapang untuk laptop kerja'],
    },
  ]

  // Exclusive facilities showcase
  const exclusivePerks = [
    {
      id: 'shuttle-bus',
      title: 'Shuttle Service',
      tag: 'Mobilitas Tanpa Kendala',
      image: 'https://bewhy.id/wp-content/uploads/url_6ad2ddca853af5.69356084.jpg',
      lead: 'Tidak perlu menghabiskan hari hanya untuk menunggu mobil di bengkel. Armada shuttle resmi siap mengantar Anda ke tujuan terdekat.',
      points: [
        'Radius antar jemput hingga 15 km mencakup mall, perkantoran, dan hunian',
        'Pengemudi ramah bersertifikasi dengan standar etika pelayanan resmi',
        'Penjemputan kembali tepat waktu sesuai estimasi selesainya kendaraan',
      ],
      actionText: 'Tanya Jadwal Shuttle',
      actionId: 'shuttle_booking',
    },
    {
      id: 'noah-coffee',
      title: 'Voucher Noah Coffee Eksklusif',
      tag: 'Specialty Coffee & Pastry',
      image: 'https://bewhy.id/wp-content/uploads/url_6ad2dd787306e5.19436225.jpg',
      lead: 'Kerja sama istimewa bersama cafe artisan Noah Coffee untuk menghadirkan seduhan kopi arabika pilihan secara cuma-cuma.',
      points: [
        'Voucher kopi spesialti gratis untuk setiap pelanggan servis berkala',
        'Pilihan seduhan espresso, caffe latte, cold brew, hingga artisan tea',
        'Dapat dinikmati di meja executive lounge atau dibawa dalam tumbler',
      ],
      actionText: 'Klaim Info Voucher',
      actionId: 'coffee_voucher',
    },
    {
      id: 'snack-corner',
      title: 'Snack Corner Free Flow',
      tag: 'Kudapan Segar Setiap Hari',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98716e00.14755433.jpeg',
      lead: 'Meja kudapan mandiri yang tertata apik, menghidangkan aneka camilan lezat dan minuman segar bebas dinikmati kapan saja.',
      points: [
        'Roti hangat, biskuit renyah, dan buah potong segar setiap pagi',
        'Pilihan infused water sehat, teh herbal aroma terapi, dan cokelat hangat',
        'Konsep self-service bersih dengan sanitasi sendok dan cangkir tertutup',
      ],
      actionText: 'Tanya Menu Snack',
      actionId: 'snack_corner',
    },
    {
      id: 'after-service-care',
      title: 'Pelayanan Tambahan Purnajual',
      tag: 'Proteksi & Kebersihan Kendaraan',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acf3655e157b3.09182578.jpeg',
      lead: 'Perhatian menyeluruh dari staf kami untuk memastikan mobil Anda kembali dalam kondisi lebih bersih dan prima daripada saat masuk bengkel.',
      points: [
        'Pemasangan cover pelindung kemudi dan jok saat pengerjaan teknis',
        'Pembersihan kaca dan pencucian bodi gratis sebelum serah terima',
        'Penjelasan hasil inspeksi 35 titik oleh Service Advisor secara transparan',
      ],
      actionText: 'Pelajari Standar Servis',
      actionId: 'after_service',
    },
    {
      id: 'security-team',
      title: 'Keamanan Terjaga dengan Tim Security Sigap',
      tag: 'Perlindungan & Sambutan 24 Jam',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e4a127.45708367.jpeg',
      lead: 'Sejak Anda melintasi gerbang masuk showroom, petugas keamanan profesional kami siap menyambut ramah dan memandu area parkir.',
      points: [
        'Pengawasan keamanan fisik dan kamera CCTV aktif di seluruh penjuru gedung',
        'Bantuan parkir sigap serta payung penjemputan saat kondisi hujan deras',
        'Verifikasi akses tamu showroom demi kenyamanan serta ketenangan konsumen',
      ],
      actionText: 'Hubungi Keamanan Dealer',
      actionId: 'security_inquiry',
    },
    {
      id: 'smoking-area',
      title: 'Outdoor Smoking & Refresh Area',
      tag: 'Area Terbuka Asri',
      image: 'https://bewhy.id/wp-content/uploads/asset_6acf36411453a6.71487944.jpeg',
      lead: 'Area khusus perokok yang dirancang di ruang terbuka hijau dengan sirkulasi udara alami yang segar dan asri.',
      points: [
        'Terpisah dari ruang tunggu utama anak dan keluarga demi udara tetap higienis',
        'Dilengkapi kursi duduk taman yang teduh dan asbak pembuangan bersih',
        'Koneksi Wi-Fi tetap terjangkau kuat untuk menemani waktu santai Anda',
      ],
      actionText: 'Informasi Lokasi Area',
      actionId: 'smoking_area',
    },
  ]

  const [activePlaygroundIndex, setActivePlaygroundIndex] = useState(0)
  const [activePerkIndex, setActivePerkIndex] = useState(0)
  const [isPlaygroundPaused, setIsPlaygroundPaused] = useState(false)
  const [isPerkPaused, setIsPerkPaused] = useState(false)
  const [openFaqId, setOpenFaqId] = useState('faq-free')

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  // 1. Auto-rotate Playground & Cafe slider every 3 seconds (infinite loop)
  useEffect(() => {
    if (isPlaygroundPaused) return
    const timer = setInterval(() => {
      setActivePlaygroundIndex((prev) => (prev === playgroundGallery.length - 1 ? 0 : prev + 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [isPlaygroundPaused, playgroundGallery.length])

  // 2. Auto-rotate Exclusive Perks slider every 3 seconds (infinite loop)
  useEffect(() => {
    if (isPerkPaused) return
    const timer = setInterval(() => {
      setActivePerkIndex((prev) => (prev === exclusivePerks.length - 1 ? 0 : prev + 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [isPerkPaused, exclusivePerks.length])

  // Carousel controls for Playground & Cafe
  const handlePrevPlayground = () => {
    setActivePlaygroundIndex((prev) => (prev === 0 ? playgroundGallery.length - 1 : prev - 1))
  }

  const handleNextPlayground = () => {
    setActivePlaygroundIndex((prev) => (prev === playgroundGallery.length - 1 ? 0 : prev + 1))
  }

  // Carousel controls for Perks
  const handlePrevPerk = () => {
    setActivePerkIndex((prev) => (prev === 0 ? exclusivePerks.length - 1 : prev - 1))
  }

  const handleNextPerk = () => {
    setActivePerkIndex((prev) => (prev === exclusivePerks.length - 1 ? 0 : prev + 1))
  }

  // Smooth scroll to facility story
  const scrollToStory = () => {
    const el = document.getElementById('purpose-spaces')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentPlayground = playgroundGallery[activePlaygroundIndex]
  const currentPerk = exclusivePerks[activePerkIndex]

  return (
    <main className="facilities-page-wrapper">
      {/* 1. HERO SECTION (Mirroring Reference: Red Architectural Theme & Editorial Typography) */}
      <section className="fac-hero-section" aria-label="Fasilitas dan Hospitalitas Dealer Sun Margahayu">
        <div
          className="fac-hero-bg-media"
          style={{
            backgroundImage: `url('https://bewhy.id/wp-content/uploads/asset_6ad2db7cd48d67.36244714.webp')`,
          }}
        >
          <div className="fac-hero-scrim" />
        </div>

        <div className="fac-hero-container">
          {/* Top meta row */}
          <div className="fac-hero-meta-top">
            <div className="fac-hero-tag-pills">
              <span className="fac-tag-pill">Dealer Sun Margahayu</span>
              <span className="fac-tag-pill">Hospitalitas Bintang 5</span>
              <span className="fac-tag-pill pill-accent">Gratis Tanpa Biaya</span>
            </div>

            <div className="fac-hero-aside-info">
              <p className="fac-aside-text">
                Gedung Showroom & Bengkel Terpadu menghadirkan fasilitas purnajual bintang 5 untuk seluruh keluarga.
              </p>
            </div>
          </div>

          {/* Main Editorial Headline */}
          <div className="fac-hero-heading-block">
            <h1 className="fac-hero-title">
              Inspired by Innovation,
              <br />
              Defined by Excellence
            </h1>
          </div>

          {/* Bottom Row */}
          <div className="fac-hero-bottom-row">
            <p className="fac-hero-subtext">
              Menciptakan ruang tunggu dan layanan yang tidak sekadar memenuhi kebutuhan servis mobil Anda hari ini, tetapi juga menghadirkan pengalaman berharga bagi seluruh keluarga.
            </p>

            <button
              type="button"
              className="fac-hero-cta-btn"
              onClick={scrollToStory}
            >
              <span>Jelajahi Fasilitas</span>
              <HiOutlineArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. SECTION 2: PURPOSE-BUILT SPACES (Mirroring Reference Middle: Left Text & Right Dark Card Slider) */}
      <section id="purpose-spaces" className="fac-purpose-section">
        <div className="fac-purpose-grid">
          {/* Left Column: Building Spaces with Purpose */}
          <div className="fac-purpose-left-col">
            <h2 className="fac-purpose-main-heading">
              Building Spaces
              <br />
              with Purpose
            </h2>

            <div className="fac-purpose-pill-cluster">
              <span className="fac-purpose-pill">Playground</span>
              <span className="fac-purpose-pill">Work From Anywhere</span>
              <span className="fac-purpose-pill">Family Friendly</span>
              <span className="fac-purpose-pill">Zero Boredom</span>
            </div>

            {/* Compact photo narrative card */}
            <div className="fac-purpose-mini-card">
              <div className="fac-mini-card-thumb-wrap">
                <img
                  src="https://bewhy.id/wp-content/uploads/asset_6acd9f98713da4.51834350.jpeg"
                  alt="Suasana ruang tunggu nyaman dealer Sun Margahayu"
                  className="fac-mini-card-img"
                  loading="lazy"
                />
              </div>
              <div className="fac-mini-card-text-wrap">
                <h3 className="fac-mini-card-title">Crafting environments that inspire</h3>
                <p className="fac-mini-card-desc">
                  Perpaduan ruang tunggu ergonomis dengan internet cepat Wi-Fi 6, area rileks bean bag, dan hiburan board game untuk menemani waktu Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Dark Rounded Interactive Card (Urban Oasis Theme) */}
          <div className="fac-purpose-right-col">
            <article
              className="fac-dark-showcase-card"
              onMouseEnter={() => setIsPlaygroundPaused(true)}
              onMouseLeave={() => setIsPlaygroundPaused(false)}
            >
              <div className="fac-dark-card-header">
                <div className="fac-dark-header-info">
                  <h3 className="fac-dark-card-title">Playground & Executive Cafe Lounge</h3>
                  <p className="fac-dark-card-subtitle">
                    Integrasi ramah keluarga, zona bermain anak higienis, board games seru, serta area kerja tenang.
                  </p>
                </div>

                <div className="fac-dark-header-controls">
                  <span className="fac-card-counter">
                    {activePlaygroundIndex + 1} / {playgroundGallery.length}
                  </span>
                  <div className="fac-card-arrows">
                    <button
                      type="button"
                      className="fac-card-nav-btn"
                      onClick={handlePrevPlayground}
                      aria-label="Lihat foto fasilitas sebelumnya"
                    >
                      <HiOutlineArrowLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="fac-card-nav-btn"
                      onClick={handleNextPlayground}
                      aria-label="Lihat foto fasilitas berikutnya"
                    >
                      <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Container with smooth transition */}
              <div className="fac-dark-media-container">
                <img
                  key={currentPlayground.id}
                  src={currentPlayground.image}
                  alt={currentPlayground.title}
                  className="fac-dark-media-img"
                />
              </div>

              {/* Caption Bar positioned below the media so it does not cover the photo */}
              <div key={currentPlayground.id} className="fac-media-caption-bar fac-animated-detail">
                <div className="fac-media-caption-left">
                  <div className="fac-media-caption-header-row">
                    <span className="fac-media-category">{currentPlayground.category}</span>
                    <strong className="fac-media-item-title">{currentPlayground.title}</strong>
                  </div>
                  <p className="fac-media-description">{currentPlayground.description}</p>
                </div>

                <div className="fac-media-badge-tag">
                  <HiOutlineSparkles size={14} />
                  <span>{currentPlayground.badge}</span>
                </div>
              </div>

              {/* Thumbnails strip for easy clicking */}
              <div className="fac-thumbnails-selector" role="tablist" aria-label="Pilih foto playground">
                {playgroundGallery.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activePlaygroundIndex}
                    className={`fac-thumb-dot ${idx === activePlaygroundIndex ? 'is-active' : ''}`}
                    onClick={() => setActivePlaygroundIndex(idx)}
                    title={item.title}
                  >
                    <span className="fac-thumb-dot-inner" />
                    <span className="fac-thumb-label">{idx + 1}</span>
                  </button>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3: EDITORIAL MANIFESTO (Mirroring Reference Third Section: Clean Light Editorial Statement) */}
      <section className="fac-manifesto-section" aria-label="Manifesto Filosofi Passion to Care">
        <div className="fac-manifesto-container">
          <div className="fac-manifesto-badge-row">
            <span className="fac-pill-outline">Filosofi Layanan</span>
            <span className="fac-pill-outline">Passion to Care</span>
          </div>

          <blockquote className="fac-manifesto-quote">
            Berakar dari komitmen tanpa kompromi terhadap kenyamanan konsumen, kami percaya waktu tunggu servis kendaraan bukanlah jeda yang membosankan, melainkan ruang berharga untuk bekerja, bersantai, dan berkumpul bersama keluarga.
          </blockquote>

          <div className="fac-manifesto-footer-row">
            <p className="fac-manifesto-subcopy">
              Kami percaya bahwa fasilitas dealer harus menghadirkan rasa tenang dan kepedulian tulus. Setiap sudut showroom dan bengkel resmi Sun Margahayu dirancang dengan empati, memberikan rasa aman layaknya rumah kedua bagi setiap pemilik kendaraan.
            </p>

            <div className="fac-manifesto-stats-wrap">
              <div className="fac-stat-block">
                <span className="fac-stat-num">100%</span>
                <span className="fac-stat-label">Gratis untuk Pelanggan</span>
              </div>
              <div className="fac-stat-block">
                <span className="fac-stat-num">15 KM</span>
                <span className="fac-stat-label">Jangkauan Shuttle Service</span>
              </div>
              <div className="fac-stat-block">
                <span className="fac-stat-num">Wi-Fi 6</span>
                <span className="fac-stat-label">Kecepatan Tinggi</span>
              </div>
            </div>
          </div>

          {/* Banner Komitmen Passion to Care with Authentic Editorial Frame */}
          <div className="fac-banner-card-frame">
            <div className="fac-banner-img-wrap">
              <img
                src="https://bewhy.id/wp-content/uploads/asset_6acf43d623b969.40085281.jpeg"
                alt="Banner Komitmen Resmi Passion to Care PT Sun Star Prima Motor"
                className="fac-banner-img"
                loading="lazy"
              />
            </div>
            <div className="fac-banner-caption-box">
              <div className="fac-caption-badge">
                <HiOutlineShieldCheck size={16} />
                <span>Piagam Resmi Hospitalitas</span>
              </div>
              <h3 className="fac-caption-heading">Standar Komitmen Passion To Care Sun Margahayu</h3>
              <p className="fac-caption-desc">
                Deklarasi resmi seluruh manajemen, tim teknisi, dan staf penyerahan kendaraan untuk melayani setiap pelanggan dengan kejujuran, ketepatan waktu, dan keramahan tanpa pamrih.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 4: DARK CONTRAST SECTION (Mirroring Reference Bottom: Crafting Spaces, Crafting Stories) */}
      <section className="fac-stories-dark-section" aria-label="Kisah Fasilitas Eksklusif Dealer">
        <div className="fac-stories-container">
          {/* Top Bar with Carousel Controls */}
          <div className="fac-stories-header">
            <div className="fac-stories-header-left">
              <span className="fac-stories-tag">HOSPITALITAS EKSKLUSIF</span>
              <h2 className="fac-stories-title">Crafting Spaces, Crafting Stories</h2>
            </div>

            <div className="fac-stories-controls">
              <span className="fac-stories-counter">
                0{activePerkIndex + 1} / 0{exclusivePerks.length}
              </span>
              <div className="fac-stories-arrow-group">
                <button
                  type="button"
                  className="fac-stories-nav-btn"
                  onClick={handlePrevPerk}
                  aria-label="Lihat layanan eksklusif sebelumnya"
                >
                  <HiOutlineArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  className="fac-stories-nav-btn"
                  onClick={handleNextPerk}
                  aria-label="Lihat layanan eksklusif berikutnya"
                >
                  <HiOutlineArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Showcase Main Split Grid */}
          <div
            className="fac-stories-split-card"
            onMouseEnter={() => setIsPerkPaused(true)}
            onMouseLeave={() => setIsPerkPaused(false)}
          >
            {/* Left Media with Rounded Corner */}
            <div className="fac-stories-media-col">
              <div className="fac-stories-photo-box">
                <img
                  key={currentPerk.id}
                  src={currentPerk.image}
                  alt={currentPerk.title}
                  className="fac-stories-img"
                />
                <span className="fac-stories-badge-overlay">{currentPerk.tag}</span>
              </div>

              {/* Second Photo if available (e.g. after-service extra photo) */}
              {currentPerk.id === 'after-service-care' && (
                <div className="fac-stories-extra-photo-strip">
                  <img
                    src="https://bewhy.id/wp-content/uploads/asset_6acf3655e233d6.99842531.jpeg"
                    alt="Inspeksi purna jual ramah dan detail oleh Service Advisor"
                    className="fac-stories-extra-thumb"
                  />
                  <div className="fac-extra-text">
                    <strong>Pengecekan Akhir Bersama Konsumen</strong>
                    <p>Memastikan setiap pengerjaan sesuai kebutuhan tanpa ada biaya tersembunyi.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Narrative Detail */}
            <div key={currentPerk.id} className="fac-stories-detail-col fac-animated-detail">
              <div className="fac-stories-meta-line">
                <span className="fac-meta-number">FASILITAS #{activePerkIndex + 1}</span>
                <span className="fac-meta-dot">•</span>
                <span className="fac-meta-cat">Hospitalitas Bintang 5</span>
              </div>

              <h3 className="fac-stories-heading">{currentPerk.title}</h3>

              <p className="fac-stories-lead">{currentPerk.lead}</p>

              <div className="fac-stories-checklist-divider" />

              <ul className="fac-stories-checklist">
                {currentPerk.points.map((pt, idx) => (
                  <li key={idx} className="fac-stories-check-item">
                    <span className="fac-check-circle">
                      <HiOutlineCheck size={14} />
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="fac-stories-actions-row">
                <button
                  type="button"
                  className="btn-fac-action-primary"
                  onClick={() => {
                    if (onOpenAiChat) {
                      onOpenAiChat({
                        id: currentPerk.actionId,
                        title: currentPerk.title,
                      })
                    }
                  }}
                >
                  <HiOutlineChatBubbleLeftRight size={17} />
                  <span>{currentPerk.actionText} via Asisten AI</span>
                </button>

                <div className="fac-free-perk-guarantee">
                  <HiOutlineShieldCheck size={18} />
                  <span>Layanan Bebas Biaya Resmi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Perk Selector Bar */}
          <div
            className="fac-perks-selector-grid"
            onMouseEnter={() => setIsPerkPaused(true)}
            onMouseLeave={() => setIsPerkPaused(false)}
          >
            {exclusivePerks.map((perk, pIdx) => (
              <button
                key={perk.id}
                type="button"
                className={`fac-perk-tab-card ${pIdx === activePerkIndex ? 'is-active' : ''}`}
                onClick={() => setActivePerkIndex(pIdx)}
              >
                <div className="fac-tab-top">
                  <span className="fac-tab-tag">{perk.tag}</span>
                </div>
                <h4 className="fac-tab-title">{perk.title}</h4>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GOOGLE REVIEWS EMBED SECTION */}
      <GoogleReviewsEmbed />

      {/* 5. SECTION 5: PANDUAN KUNJUNGAN & FAQ (Informasi Nyata & Berguna) */}
      <section className="fac-guide-section" aria-label="Panduan Kunjungan Fasilitas">
        <div className="fac-guide-container">
          <div className="fac-guide-header">
            <span className="fac-pill-outline">Panduan Kunjungan</span>
            <h2 className="fac-guide-title">Pertanyaan Umum Seputar Fasilitas Dealer</h2>
            <p className="fac-guide-subtitle">
              Seluruh fasilitas kami sediakan untuk menunjang kenyamanan maksimal Anda selama berkunjung.
            </p>
          </div>

          <div className="fac-faq-grid" role="region" aria-label="Accordion Pertanyaan Umum Fasilitas">
            {FACILITY_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id
              return (
                <div
                  key={faq.id}
                  className={`fac-faq-item ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="fac-faq-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-trigger-${faq.id}`}
                  >
                    <div className="fac-faq-q">
                      <HiOutlineQuestionMarkCircle size={20} className="faq-icon" />
                      <span>{faq.question}</span>
                    </div>
                    <HiOutlineChevronDown className="fac-faq-chevron" aria-hidden="true" />
                  </button>

                  <div
                    id={`faq-answer-${faq.id}`}
                    className="fac-faq-collapse"
                    role="region"
                    aria-labelledby={`faq-trigger-${faq.id}`}
                  >
                    <div className="fac-faq-collapse-inner">
                      <p className="fac-faq-a">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="fac-bottom-cta-banner">
            <div className="fac-cta-banner-left">
              <h3 className="fac-cta-banner-title">Punya Pertanyaan Spesifik tentang Kunjungan Anda?</h3>
              <p className="fac-cta-banner-desc">
                Konsultasikan jadwal servis, ketersediaan shuttle service, atau fasilitas lainnya secara langsung bersama Asisten AI Sunny 24 jam sehari.
              </p>
            </div>

            <div className="fac-cta-banner-btns">
              <button
                type="button"
                className="btn-banner-ai-chat"
                onClick={() => {
                  if (onOpenAiChat) {
                    onOpenAiChat({
                      id: 'facilities_inquiry',
                      title: 'Pertanyaan Fasilitas Dealer Sun Margahayu',
                    })
                  }
                }}
              >
                <HiOutlineChatBubbleLeftRight size={18} />
                <span>Tanya Asisten AI 24/7</span>
              </button>

              <Link to="/#layanan" className="btn-banner-back-home">
                <span>Kembali ke Layanan</span>
                <HiOutlineArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
