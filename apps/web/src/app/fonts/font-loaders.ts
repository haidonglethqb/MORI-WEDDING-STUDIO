import {
  Allura,
  Be_Vietnam_Pro,
  Charm,
  Cormorant_Garamond,
  Dancing_Script,
  EB_Garamond,
  Great_Vibes,
  Josefin_Sans,
  Lora,
  Mali,
  Merriweather,
  Montserrat,
  Nunito,
  Pacifico,
  Patrick_Hand,
  Playfair_Display,
  Quicksand,
} from 'next/font/google'

const moriF01 = Cormorant_Garamond({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f01',
  display: 'swap',
})
const moriF02 = Playfair_Display({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f02',
  display: 'swap',
})
const moriF03 = EB_Garamond({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f03',
  display: 'swap',
})
const moriF04 = Lora({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f04',
  display: 'swap',
})
const moriF05 = Dancing_Script({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f05',
  display: 'swap',
})
const moriF06 = Great_Vibes({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--mori-f06',
  display: 'swap',
})
const moriF07 = Allura({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--mori-f07',
  display: 'swap',
})
const moriF08 = Pacifico({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--mori-f08',
  display: 'swap',
})
const moriF09 = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f09',
  display: 'swap',
})
const moriF10 = Montserrat({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f10',
  display: 'swap',
})
const moriF11 = Josefin_Sans({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f11',
  display: 'swap',
})
const moriF12 = Quicksand({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f12',
  display: 'swap',
})
const moriF13 = Merriweather({
  subsets: ['vietnamese'],
  weight: ['400', '700'],
  variable: '--mori-f13',
  display: 'swap',
})
const moriF14 = Nunito({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f14',
  display: 'swap',
})
const moriF15 = Mali({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--mori-f15',
  display: 'swap',
})
const moriF16 = Patrick_Hand({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--mori-f16',
  display: 'swap',
})
const moriInviteBody = Charm({
  subsets: ['vietnamese'],
  weight: ['400'],
  variable: '--mori-invite-charm',
  display: 'swap',
})

export const FONT_VARIABLE_CLASSNAME = [
  moriF01.variable,
  moriF02.variable,
  moriF03.variable,
  moriF04.variable,
  moriF05.variable,
  moriF06.variable,
  moriF07.variable,
  moriF08.variable,
  moriF09.variable,
  moriF10.variable,
  moriF11.variable,
  moriF12.variable,
  moriF13.variable,
  moriF14.variable,
  moriF15.variable,
  moriF16.variable,
  moriInviteBody.variable,
].join(' ')
