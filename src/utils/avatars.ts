/**
 * 5个内置 SVG 矢量头像
 * 小狗、小猫、可爱女生、帅气男生、外星人
 */

export interface AvatarDef {
  id: string
  name: string
  dataUrl: string
}

function svgToDataUrl(svg: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  const utf8 = unescape(encodeURIComponent(svg))
  let base64 = ''
  let i = 0
  while (i < utf8.length) {
    const a = utf8.charCodeAt(i++) || 0
    const b = utf8.charCodeAt(i++) || 0
    const c = utf8.charCodeAt(i++) || 0
    base64 += chars.charAt(a >> 2)
    base64 += chars.charAt(((a & 3) << 4) | (b >> 4))
    base64 += chars.charAt(((b & 15) << 2) | (c >> 6))
    base64 += chars.charAt(c & 63)
  }
  const pad = utf8.length % 3
  if (pad === 1) base64 = base64.slice(0, -2) + '=='
  else if (pad === 2) base64 = base64.slice(0, -1) + '='
  return 'data:image/svg+xml;base64,' + base64
}

// ==================== 小狗 ====================
function svgDog(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#D4A574"/>
    <ellipse cx="14" cy="38" rx="14" ry="24" fill="#B8895E"/>
    <ellipse cx="86" cy="38" rx="14" ry="24" fill="#B8895E"/>
    <ellipse cx="50" cy="60" rx="26" ry="22" fill="#E8C4A0"/>
    <circle cx="36" cy="44" r="5.5" fill="#333"/>
    <circle cx="64" cy="44" r="5.5" fill="#333"/>
    <circle cx="38" cy="42" r="2" fill="#fff"/>
    <circle cx="66" cy="42" r="2" fill="#fff"/>
    <ellipse cx="50" cy="54" rx="5" ry="3.5" fill="#333"/>
    <path d="M45 59 Q50 66 55 59" stroke="#333" fill="none" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="50" cy="64" rx="4" ry="5" fill="#FF8A80"/>
  </svg>`
}

// ==================== 小猫 ====================
function svgCat(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="46" fill="#F5A623"/>
    <polygon points="20,38 8,10 32,30" fill="#F5A623"/>
    <polygon points="80,38 92,10 68,30" fill="#F5A623"/>
    <polygon points="24,34 14,14 32,30" fill="#FFB8D0"/>
    <polygon points="76,34 86,14 68,30" fill="#FFB8D0"/>
    <ellipse cx="36" cy="44" rx="5" ry="6" fill="#333"/>
    <ellipse cx="64" cy="44" rx="5" ry="6" fill="#333"/>
    <circle cx="38" cy="42" r="2" fill="#fff"/>
    <circle cx="66" cy="42" r="2" fill="#fff"/>
    <polygon points="50,53 46,58 54,58" fill="#FF8A80"/>
    <path d="M42 62 Q50 68 58 62" stroke="#333" fill="none" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="18" y1="50" x2="32" y2="52" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
    <line x1="18" y1="56" x2="32" y2="54" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
    <line x1="82" y1="50" x2="68" y2="52" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
    <line x1="82" y1="56" x2="68" y2="54" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
  </svg>`
}

// ==================== 可爱女生 ====================
function svgGirl(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="48" cy="54" r="44" fill="#FDDCB5"/>
    <ellipse cx="48" cy="26" rx="34" ry="26" fill="#4A3728"/>
    <path d="M16 24 Q14 50 22 68" stroke="#4A3728" fill="none" stroke-width="12" stroke-linecap="round"/>
    <path d="M80 24 Q82 50 74 68" stroke="#4A3728" fill="none" stroke-width="12" stroke-linecap="round"/>
    <circle cx="72" cy="14" r="8" fill="#FF6B8A"/>
    <circle cx="72" cy="14" r="4" fill="#FF8FAA"/>
    <ellipse cx="36" cy="46" rx="5" ry="6" fill="#333"/>
    <ellipse cx="60" cy="46" rx="5" ry="6" fill="#333"/>
    <circle cx="38" cy="44" r="2.5" fill="#fff"/>
    <circle cx="62" cy="44" r="2.5" fill="#fff"/>
    <circle cx="30" cy="54" r="4" fill="#FFB5C5" opacity="0.6"/>
    <circle cx="66" cy="54" r="4" fill="#FFB5C5" opacity="0.6"/>
    <path d="M44 62 Q48 68 52 62" stroke="#FF6B8A" fill="none" stroke-width="2" stroke-linecap="round"/>
  </svg>`
}

// ==================== 帅气男生 ====================
function svgBoy(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="54" r="46" fill="#FDDCB5"/>
    <ellipse cx="50" cy="26" rx="36" ry="22" fill="#2C1810"/>
    <path d="M14 30 Q10 16 20 12 Q34 6 50 8 Q66 6 80 12 Q90 16 86 30" stroke="#2C1810" fill="none" stroke-width="8"/>
    <ellipse cx="36" cy="46" rx="4" ry="5" fill="#333"/>
    <ellipse cx="64" cy="46" rx="4" ry="5" fill="#333"/>
    <circle cx="37" cy="44" r="1.5" fill="#fff"/>
    <circle cx="65" cy="44" r="1.5" fill="#fff"/>
    <path d="M30 40 Q36 36 42 40" stroke="#2C1810" fill="none" stroke-width="2" stroke-linecap="round"/>
    <path d="M58 40 Q64 36 70 40" stroke="#2C1810" fill="none" stroke-width="2" stroke-linecap="round"/>
    <path d="M42 62 Q50 70 58 62" stroke="#333" fill="none" stroke-width="2" stroke-linecap="round"/>
  </svg>`
}

// ==================== 外星人 ====================
function svgAlien(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="54" r="46" fill="#7BC67E"/>
    <line x1="50" y1="8" x2="50" y2="24" stroke="#7BC67E" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="6" r="5" fill="#FFE066"/>
    <circle cx="50" cy="6" r="2.5" fill="#FFB300"/>
    <ellipse cx="32" cy="48" rx="10" ry="12" fill="#333"/>
    <ellipse cx="68" cy="48" rx="10" ry="12" fill="#333"/>
    <circle cx="36" cy="46" r="3.5" fill="#fff"/>
    <circle cx="72" cy="46" r="3.5" fill="#fff"/>
    <circle cx="29" cy="45" r="1.5" fill="#fff"/>
    <circle cx="65" cy="45" r="1.5" fill="#fff"/>
    <ellipse cx="50" cy="65" rx="6" ry="3" fill="#5AAD5E"/>
    <path d="M50 68 L50 78" stroke="#5AAD5E" stroke-width="2" stroke-linecap="round"/>
    <circle cx="46" cy="80" r="2" fill="#5AAD5E"/>
    <circle cx="54" cy="80" r="2" fill="#5AAD5E"/>
    <circle cx="28" cy="72" r="3" fill="#7BC67E" opacity="0.6"/>
    <circle cx="72" cy="72" r="2.5" fill="#7BC67E" opacity="0.6"/>
    <circle cx="22" cy="28" r="2" fill="#7BC67E" opacity="0.4"/>
    <circle cx="78" cy="30" r="1.5" fill="#7BC67E" opacity="0.4"/>
  </svg>`
}

const AVATARS: AvatarDef[] = [
  { id: 'dog', name: '小狗', dataUrl: svgToDataUrl(svgDog()) },
  { id: 'cat', name: '小猫', dataUrl: svgToDataUrl(svgCat()) },
  { id: 'girl', name: '可爱女生', dataUrl: svgToDataUrl(svgGirl()) },
  { id: 'boy', name: '帅气男生', dataUrl: svgToDataUrl(svgBoy()) },
  { id: 'alien', name: '外星人', dataUrl: svgToDataUrl(svgAlien()) },
]

export { AVATARS }

/** 根据 id 获取头像定义 */
export function getAvatarDef(id: string): AvatarDef | undefined {
  return AVATARS.find(a => a.id === id)
}

/** 获取头像 dataUrl，不存在则返回默认 */
export function getAvatarUrl(id?: string): string {
  if (!id) return ''
  return getAvatarDef(id)?.dataUrl || ''
}
