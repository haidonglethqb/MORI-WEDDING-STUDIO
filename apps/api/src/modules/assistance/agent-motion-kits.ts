export interface MotionArtworkKit {
  id: string
  name: string
  keywords: string[]
  usageNote: string
  htmlSnippet: string
  cssSnippet: string
}

const DRAGON_PHOENIX_KIT: MotionArtworkKit = {
  id: 'dragon-phoenix',
  name: 'Long Phụng Phi Vũ (Rồng Bay Phượng Múa SVG + Keyframes)',
  keywords: ['rồng', 'phượng', 'long phụng', 'dragon', 'phoenix', 'song hỷ', 'trung hoa', 'hoàng gia', 'cung đình', 'bay', 'múa'],
  usageNote:
    'Đặt .lp-stage ở đầu thiệp (position:relative;overflow:hidden). Tùy biến màu bằng --kit-primary (Rồng) và --kit-secondary (Phượng) — hợp cả Vàng Cung Đình lẫn Neon Cyberpunk Cyan/Magenta.',
  htmlSnippet: `<div class="lp-sky" aria-hidden="true">
  <svg class="lp-dragon" viewBox="0 0 260 110" fill="none">
    <defs><linearGradient id="drgG" x1="0" y1="0" x2="260" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--kit-primary,#E5BE67)"/><stop offset="100%" stop-color="var(--kit-secondary,#FF2A85)"/></linearGradient></defs>
    <path class="lp-spine" d="M14 78 C46 28, 88 94, 132 48 C166 14, 206 62, 240 28" stroke="url(#drgG)" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M18 76 C52 40, 88 82, 132 54 C166 28, 204 54, 232 32" stroke="url(#drgG)" stroke-width="2" opacity="0.65" stroke-dasharray="4 5"/>
    <path d="M236 28 L252 22 L244 33 L254 38 L238 37 Z" fill="var(--kit-primary,#E5BE67)"/>
    <path d="M228 24 C222 10, 232 6, 239 14 M222 27 C212 16, 218 9, 227 16" stroke="var(--kit-primary,#E5BE67)" stroke-width="2" stroke-linecap="round"/>
    <path d="M76 62 C66 44, 86 42, 92 56 M142 40 C134 22, 154 22, 158 36 M186 44 C178 28, 198 28, 202 42" stroke="var(--kit-primary,#E5BE67)" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="242" cy="27" r="2" fill="#FFF"/>
  </svg>
  <svg class="lp-phoenix" viewBox="0 0 240 110" fill="none">
    <defs><linearGradient id="phxG" x1="0" y1="0" x2="240" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--kit-secondary,#FF5E9C)"/><stop offset="100%" stop-color="var(--kit-primary,#E5BE67)"/></linearGradient></defs>
    <path class="lp-wing-a" d="M122 52 C92 14, 46 18, 20 42 C56 38, 86 46, 114 60 Z" fill="url(#phxG)" opacity="0.88"/>
    <path class="lp-wing-b" d="M124 54 C156 16, 198 18, 224 44 C188 40, 158 48, 130 62 Z" fill="url(#phxG)" opacity="0.82"/>
    <path d="M120 46 C122 30, 134 24, 142 30 C134 33, 132 40, 128 52 C122 72, 98 92, 62 98 C94 86, 108 72, 116 56" stroke="url(#phxG)" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M114 66 C98 84, 78 96, 48 102 M122 68 C110 88, 94 98, 72 104" stroke="var(--kit-secondary,#FF5E9C)" stroke-width="1.6" stroke-dasharray="3 4"/>
    <circle cx="135" cy="30" r="1.8" fill="#FFF"/>
  </svg>
  <span class="lp-spark s1"></span><span class="lp-spark s2"></span><span class="lp-spark s3"></span><span class="lp-spark s4"></span>
</div>`,
  cssSnippet: `.lp-sky{position:relative;width:100%;height:150px;overflow:hidden;pointer-events:none;margin-bottom:-18px}
.lp-dragon{position:absolute;top:8px;left:-10%;width:240px;filter:drop-shadow(0 0 12px var(--kit-primary,#E5BE67));animation:lpDragonGlide 9s ease-in-out infinite}
.lp-phoenix{position:absolute;bottom:4px;right:-8%;width:220px;filter:drop-shadow(0 0 12px var(--kit-secondary,#FF5E9C));animation:lpPhoenixDance 8.5s ease-in-out infinite}
.lp-wing-a{transform-origin:118px 54px;animation:lpWingL 2.2s ease-in-out infinite alternate}
.lp-wing-b{transform-origin:126px 56px;animation:lpWingR 2.2s ease-in-out infinite alternate}
.lp-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--kit-primary,#E5BE67);box-shadow:0 0 10px var(--kit-primary,#E5BE67);animation:lpFloat 4.5s ease-in-out infinite}
.lp-spark.s1{top:24%;left:22%;animation-delay:0s}.lp-spark.s2{top:68%;left:46%;animation-delay:1.1s}.lp-spark.s3{top:32%;right:24%;animation-delay:2s}.lp-spark.s4{bottom:18%;right:40%;animation-delay:3s}
@keyframes lpDragonGlide{0%,100%{transform:translate3d(0,6px,0) rotate(-3deg)}50%{transform:translate3d(38%, -10px, 0) rotate(3deg)}}
@keyframes lpPhoenixDance{0%,100%{transform:translate3d(0,0,0) rotate(3deg)}50%{transform:translate3d(-34%,-12px,0) rotate(-4deg)}}
@keyframes lpWingL{from{transform:rotate(-8deg)}to{transform:rotate(10deg)}}
@keyframes lpWingR{from{transform:rotate(8deg)}to{transform:rotate(-10deg)}}
@keyframes lpFloat{0%,100%{transform:translateY(0) scale(.7);opacity:.35}50%{transform:translateY(-14px) scale(1.25);opacity:1}}`,
}

const CYBERPUNK_HUD_KIT: MotionArtworkKit = {
  id: 'cyberpunk-grid',
  name: 'Cyberpunk Neon Holo Grid & Scanline Frame',
  keywords: ['cyberpunk', 'cyber', 'neon', 'sci-fi', 'hologram', 'synthwave', 'glitch', 'tech', 'tương lai'],
  usageNote: 'Đặt .cy-backdrop làm lớp nền phủ toàn trang (position:fixed;inset:0;z-index:0) và dùng class .cy-panel cho khung tiêu điểm góc vát chamfered neon.',
  htmlSnippet: `<div class="cy-backdrop" aria-hidden="true"><div class="cy-grid"></div><div class="cy-scan"></div><div class="cy-orb-a"></div><div class="cy-orb-b"></div></div>`,
  cssSnippet: `.cy-backdrop{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:radial-gradient(circle at 18% 12%,rgba(0,229,255,.16),transparent 42%),radial-gradient(circle at 82% 84%,rgba(255,42,133,.16),transparent 46%),#070914}
.cy-grid{position:absolute;inset:-40% -20% -20%;background-image:linear-gradient(rgba(0,229,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.11) 1px,transparent 1px);background-size:44px 44px;transform:perspective(420px) rotateX(62deg);transform-origin:center 78%;animation:cyGridMove 10s linear infinite}
.cy-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 4px)}
.cy-orb-a{position:absolute;top:12%;left:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.26),transparent 70%);animation:cyPulse 6s ease-in-out infinite}
.cy-orb-b{position:absolute;bottom:8%;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(255,42,133,.24),transparent 70%);animation:cyPulse 7s ease-in-out infinite reverse}
.cy-panel{position:relative;background:rgba(15,21,42,.78);border:1px solid rgba(0,229,255,.42);box-shadow:0 0 24px rgba(0,229,255,.12),inset 0 0 18px rgba(255,42,133,.08);clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)}
@keyframes cyGridMove{from{background-position:0 0}to{background-position:0 44px}}
@keyframes cyPulse{0%,100%{transform:scale(.92);opacity:.65}50%{transform:scale(1.12);opacity:1}}`,
}

const SAKURA_PETALS_KIT: MotionArtworkKit = {
  id: 'sakura-petals',
  name: 'Cánh Hoa Anh Đào Rơi Nhẹ (Sakura Drift)',
  keywords: ['hoa', 'anh đào', 'sakura', 'cánh hoa', 'rơi', 'mùa xuân', 'nhật', 'blossom', 'petal', 'pastel'],
  usageNote: 'Đặt .sk-layer làm lớp phủ nhẹ (position:fixed;inset:0;pointer-events:none;z-index:1). Tùy biến màu bằng --kit-primary.',
  htmlSnippet: `<div class="sk-layer" aria-hidden="true"><i class="sk-p p1"></i><i class="sk-p p2"></i><i class="sk-p p3"></i><i class="sk-p p4"></i><i class="sk-p p5"></i><i class="sk-p p6"></i></div>`,
  cssSnippet: `.sk-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:1}
.sk-p{position:absolute;top:-10%;width:14px;height:10px;border-radius:70% 10% 70% 10%;background:var(--kit-primary,#E89EB0);opacity:.72;animation:skFall 11s linear infinite}
.sk-p.p1{left:10%;animation-duration:10s}.sk-p.p2{left:28%;animation-delay:2.2s;animation-duration:12s}.sk-p.p3{left:48%;animation-delay:4.4s;animation-duration:9.5s}.sk-p.p4{left:68%;animation-delay:1.3s;animation-duration:13s}.sk-p.p5{left:84%;animation-delay:3.6s;animation-duration:11s}.sk-p.p6{left:92%;animation-delay:5.5s;animation-duration:12.5s}
@keyframes skFall{0%{transform:translate3d(0,0,0) rotate(0deg);opacity:0}12%{opacity:.78}88%{opacity:.7}100%{transform:translate3d(-70px,105vh,0) rotate(320deg);opacity:0}}`,
}

const SKY_LANTERNS_KIT: MotionArtworkKit = {
  id: 'sky-lanterns',
  name: 'Đèn Lồng Trời & Ánh Sáng Bay (Floating Lanterns)',
  keywords: ['đèn lồng', 'lantern', 'thả đèn', 'hội an', 'lễ hội', 'lung linh', 'nến', 'ấm áp'],
  usageNote: 'Đặt .ln-layer làm lớp nền chuyển động đèn lồng bay lên nhẹ nhàng.',
  htmlSnippet: `<div class="ln-layer" aria-hidden="true"><span class="ln l1"></span><span class="ln l2"></span><span class="ln l3"></span><span class="ln l4"></span></div>`,
  cssSnippet: `.ln-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.ln{position:absolute;bottom:-48px;width:18px;height:24px;border-radius:7px 7px 4px 4px;background:radial-gradient(circle at 50% 62%,#FFF5CC 0%,var(--kit-primary,#F2A949) 62%,rgba(220,90,35,.85) 100%);box-shadow:0 0 20px rgba(245,180,75,.55);animation:lnRise 14s linear infinite}
.ln.l1{left:14%;animation-duration:13s}.ln.l2{left:38%;animation-delay:3.5s;width:14px;height:19px}.ln.l3{left:68%;animation-delay:7s;animation-duration:15s}.ln.l4{left:86%;animation-delay:2s;width:15px;height:20px}
@keyframes lnRise{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.85}85%{opacity:.75}100%{transform:translate3d(24px,-112vh,0);opacity:0}}`,
}

const STARLIGHT_AURORA_KIT: MotionArtworkKit = {
  id: 'starlight-aurora',
  name: 'Tinh Tú Lấp Lánh & Sao Băng (Starlight Aurora)',
  keywords: ['sao', 'star', 'đêm', 'bầu trời', 'đà lạt', 'cực quang', 'aurora', 'sao băng', 'lấp lánh', 'sparkle'],
  usageNote: 'Đặt .st-layer làm lớp sao băng + cực quang dịu ở nền thiệp tối.',
  htmlSnippet: `<div class="st-layer" aria-hidden="true"><div class="st-aurora"></div><span class="st-shoot"></span><span class="st-tw t1"></span><span class="st-tw t2"></span><span class="st-tw t3"></span><span class="st-tw t4"></span></div>`,
  cssSnippet: `.st-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.st-aurora{position:absolute;top:-20%;left:-10%;right:-10%;height:55%;background:radial-gradient(ellipse at 35% 40%,rgba(92,165,255,.2),transparent 60%),radial-gradient(ellipse at 70% 35%,rgba(226,194,117,.16),transparent 58%);animation:stWave 12s ease-in-out infinite alternate}
.st-shoot{position:absolute;top:14%;right:8%;width:90px;height:1.5px;background:linear-gradient(90deg,transparent,var(--kit-primary,#E2C275),#FFF);transform:rotate(-24deg);opacity:0;animation:stShoot 7s ease-in infinite}
.st-tw{position:absolute;width:4px;height:4px;border-radius:50%;background:#FFF;box-shadow:0 0 8px var(--kit-primary,#E2C275);animation:stTwinkle 3.8s ease-in-out infinite}
.st-tw.t1{top:16%;left:18%}.st-tw.t2{top:28%;right:22%;animation-delay:1.2s}.st-tw.t3{top:58%;left:12%;animation-delay:2.1s}.st-tw.t4{bottom:24%;right:16%;animation-delay:.7s}
@keyframes stWave{from{transform:translateX(-4%) scale(1)}to{transform:translateX(4%) scale(1.06)}}
@keyframes stShoot{0%,72%{transform:translate3d(0,0,0) rotate(-24deg);opacity:0}78%{opacity:1}100%{transform:translate3d(-240px,110px,0) rotate(-24deg);opacity:0}}
@keyframes stTwinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}`,
}

export const MOTION_ARTWORK_KITS: readonly MotionArtworkKit[] = [
  DRAGON_PHOENIX_KIT,
  CYBERPUNK_HUD_KIT,
  SAKURA_PETALS_KIT,
  SKY_LANTERNS_KIT,
  STARLIGHT_AURORA_KIT,
]

export function searchMotionArtworkKits(query: string): MotionArtworkKit[] {
  const hay = query.toLowerCase()
  const scored = MOTION_ARTWORK_KITS.map((kit) => {
    let score = 0
    for (const kw of kit.keywords) {
      if (hay.includes(kw)) score += kw.length > 4 ? 3 : 2
    }
    return { kit, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return [STARLIGHT_AURORA_KIT]
  return scored.slice(0, 2).map((x) => x.kit)
}
