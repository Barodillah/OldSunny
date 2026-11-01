/**
 * SEO & DYNAMIC METADATA UTILITY FOR MITSUBISHI SUN MARGAHAYU
 * Handles client-side meta tags, Open Graph (WhatsApp, FB, LinkedIn),
 * and Twitter Card metadata updates on SPA navigation.
 */

export const DEFAULT_SEO = {
  siteName: 'Mitsubishi Sun Margahayu',
  title: 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7',
  description:
    'Dealer resmi Mitsubishi Sun Star Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.',
  keywords:
    'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi, servis mitsubishi 24 jam, xforce, pajero sport, xpander, booking service mitsubishi, sun star motor',
  image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  type: 'website',
  author: 'PT. Sun Star Motor Margahayu',
}

// Static route configuration mapping
export const PAGE_SEO_CONFIG = {
  '/': {
    title: 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7',
    description:
      'Dealer resmi Mitsubishi Sun Star Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.',
    keywords:
      'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi, servis mitsubishi 24 jam, xforce, pajero sport, xpander',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/vehicles': {
    title: 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
    description:
      'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi: New Pajero Sport, Xforce, Xpander, Xpander Cross, Triton, dan L300.',
    keywords:
      'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, promo xpander bekasi, simulasi kredit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
  },
  '/vehicle-list': {
    title: 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
    description:
      'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi: New Pajero Sport, Xforce, Xpander, Xpander Cross, Triton, dan L300.',
    keywords:
      'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, promo xpander bekasi, simulasi kredit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
  },
  '/promo': {
    title: 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
    description:
      'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
    keywords:
      'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi, bunga 0 persen mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/promo-event': {
    title: 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
    description:
      'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
    keywords:
      'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi, bunga 0 persen mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/booking': {
    title: 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Jadwalkan perawatan berkala, servis cepat, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu siaga 24 jam.',
    keywords:
      'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi, ganti oli mitsubishi, perawatan berkala xpander',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
  },
  '/booking-service': {
    title: 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Jadwalkan perawatan berkala, servis cepat, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu siaga 24 jam.',
    keywords:
      'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi, ganti oli mitsubishi, perawatan berkala xpander',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
  },
  '/service-on-road': {
    title: 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
    description:
      'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
    keywords:
      'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi, derek mobil mitsubishi, darurat bengkel 24 jam',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
  },
  '/service-on-the-road': {
    title: 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
    description:
      'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
    keywords:
      'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi, derek mobil mitsubishi, darurat bengkel 24 jam',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
  },
  '/facilities': {
    title: 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Eksplorasi fasilitas 3S (Sales, Service, Spare Parts) berstandar global: lounge eksekutif, kids zone, EV charger, dan pit servis modern.',
    keywords:
      'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu, lounge dealer mitsubishi, ev charger bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/fasilitas': {
    title: 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Eksplorasi fasilitas 3S (Sales, Service, Spare Parts) berstandar global: lounge eksekutif, kids zone, EV charger, dan pit servis modern.',
    keywords:
      'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu, lounge dealer mitsubishi, ev charger bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/accessories': {
    title: 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
    description:
      'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi bergaransi resmi di Sun Margahayu Bekasi.',
    keywords:
      'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi, body kit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/aksesoris': {
    title: 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
    description:
      'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi bergaransi resmi di Sun Margahayu Bekasi.',
    keywords:
      'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi, body kit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/sales': {
    title: 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
    description:
      'Verifikasi profil sales konsultan resmi Mitsubishi Sun Star Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
    keywords:
      'sales mitsubishi bekasi, sales resmi sun margahayu, sales consultant mitsubishi, verifikasi sales anti penipuan',
    image: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  '/sales-list': {
    title: 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
    description:
      'Verifikasi profil sales konsultan resmi Mitsubishi Sun Star Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
    keywords:
      'sales mitsubishi bekasi, sales resmi sun margahayu, sales consultant mitsubishi, verifikasi sales anti penipuan',
    image: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  '/organization': {
    title: 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
    description:
      'Mengenal jajaran manajemen dan tim profesional PT Sun Star Motor Margahayu Bekasi yang berdedikasi melayani kepemilikan Mitsubishi Anda.',
    keywords:
      'struktur organisasi sun margahayu, profil pt sun star motor bekasi, dealer mitsubishi bekasi timur',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/struktur-organisasi': {
    title: 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
    description:
      'Mengenal jajaran manajemen dan tim profesional PT Sun Star Motor Margahayu Bekasi yang berdedikasi melayani kepemilikan Mitsubishi Anda.',
    keywords:
      'struktur organisasi sun margahayu, profil pt sun star motor bekasi, dealer mitsubishi bekasi timur',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/news': {
    title: 'Berita, Edukasi Otomotif & Update Resmi | Mitsubishi Sun Margahayu',
    description:
      'Kumpulan artikel otomotif terkini, tips perawatan mobil, review unit Mitsubishi, dan pengumuman program dealer Sun Margahayu.',
    keywords:
      'berita mitsubishi, tips otomotif mitsubishi, review xforce bekasi, artikel dealer sun margahayu',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
  },
  '/contact': {
    title: 'Kontak & Lokasi Dealer Resmi | Mitsubishi Sun Margahayu Bekasi',
    description:
      'Alamat lengkap, nomor telepon, WhatsApp resmi, dan panduan arah menuju dealer Mitsubishi Sun Star Motor Margahayu Bekasi.',
    keywords:
      'alamat mitsubishi sun margahayu, nomor telepon mitsubishi bekasi, whatsapp dealer mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
  '/search': {
    title: 'Pencarian Layanan & Kendaraan | Mitsubishi Sun Margahayu',
    description:
      'Temukan informasi unit mobil, paket servis, promo terkini, dan panduan otomotif di Mitsubishi Sun Margahayu.',
    keywords: 'pencarian mitsubishi sun margahayu, cari mobil bekasi, cari servis mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  },
}

/**
 * Set or update a meta tag in document head safely
 */
function setMetaTag(selector, attributeName, attributeValue, content) {
  if (typeof document === 'undefined') return
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content || '')
}

/**
 * Set or update canonical link tag
 */
function setCanonicalTag(url) {
  if (typeof document === 'undefined') return
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url || window.location.href)
}

/**
 * Core function to update document title & all SEO meta tags
 */
export function updateDocumentMeta(options = {}) {
  if (typeof document === 'undefined') return

  const title = options.title || DEFAULT_SEO.title
  const description = options.description || DEFAULT_SEO.description
  const keywords = options.keywords || DEFAULT_SEO.keywords
  const image = options.image || DEFAULT_SEO.image
  const type = options.type || DEFAULT_SEO.type
  const author = options.author || DEFAULT_SEO.author
  const currentUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '')

  // 1. Browser Window & Tab Title
  document.title = title

  // 2. Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description)
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords)
  setMetaTag('meta[name="author"]', 'name', 'author', author)

  // 3. Open Graph (Facebook, WhatsApp, Telegram, LinkedIn)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image)
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl)
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type)
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SEO.siteName)

  // 4. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image)

  // 5. Canonical Link
  setCanonicalTag(currentUrl)
}

