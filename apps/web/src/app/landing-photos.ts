/**
 * Landing photography. These are interim, rights-cleared Unsplash images that
 * illustrate the stationery direction until MORI's own studio photography is
 * supplied (see docs/launch-inputs.md). Files are self-hosted so the
 * production CSP (`img-src 'self'`) keeps working.
 */
export interface LandingPhoto {
  src: string
  width: number
  height: number
  alt: string
}

const base = '/images/landing'

export const landingPhotos = {
  hero: {
    src: `${base}/hero-ivory-suite.jpg`,
    width: 2200,
    height: 1467,
    alt: 'Bộ thiệp cưới tông ngà đặt trên nền vải, điểm cỏ lau và ruy băng lụa',
  },
  craft: {
    src: `${base}/craft-wax-sealing.jpg`,
    width: 1300,
    height: 1950,
    alt: 'Đôi tay đang đóng dấu sáp lên phong bì trên bàn gỗ',
  },
  detail: {
    src: `${base}/detail-olive-seal.jpg`,
    width: 900,
    height: 1200,
    alt: 'Con dấu sáp trên dải ruy băng xanh ô liu và hoa khô',
  },
  material: {
    src: `${base}/material-sage-linen.jpg`,
    width: 2000,
    height: 1334,
    alt: 'Bộ thiệp giấy gồm thiệp mời, thiệp hồi đáp và lịch trình trên nền vải xanh xô thơm',
  },
  process: {
    src: `${base}/process-calligraphy.jpg`,
    width: 1300,
    height: 1890,
    alt: 'Phong bì đã niêm phong cạnh bút, mực và các dụng cụ viết thư pháp',
  },
  close: {
    src: `${base}/close-sealed-envelopes.jpg`,
    width: 1400,
    height: 1973,
    alt: '',
  },
  rosterPaper: {
    src: `${base}/roster-paper-suite.jpg`,
    width: 900,
    height: 600,
    alt: '',
  },
  rosterDigital: {
    src: `${base}/roster-save-the-date.jpg`,
    width: 900,
    height: 600,
    alt: '',
  },
  rosterIdeas: {
    src: `${base}/roster-paper-swatches.jpg`,
    width: 900,
    height: 600,
    alt: '',
  },
  collection: {
    src: `${base}/collection-placeholder.jpg`,
    width: 1000,
    height: 1500,
    alt: 'Bộ thiệp cưới trắng đặt trên khay vàng cùng hoa trắng',
  },
} satisfies Record<string, LandingPhoto>
