/**
 * カメラが使えない環境でもデモを一気通貫で試せるよう、
 * 「サンプル写真を使う」ボタン用にその場で SVG を組み立てて data URL 化する。
 */
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function sampleOdometerImage(km: number): string {
  const odo = String(Math.round(km)).padStart(6, "0");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="80%">
      <stop offset="0%" stop-color="#2b2f38"/>
      <stop offset="100%" stop-color="#0d0f13"/>
    </radialGradient>
  </defs>
  <rect width="640" height="400" fill="url(#bg)"/>
  <circle cx="180" cy="200" r="140" fill="none" stroke="#3a4150" stroke-width="10"/>
  <circle cx="460" cy="200" r="140" fill="none" stroke="#3a4150" stroke-width="10"/>
  <text x="180" y="215" font-family="Arial" font-size="34" fill="#8fe0a0" text-anchor="middle">60</text>
  <text x="460" y="215" font-family="Arial" font-size="34" fill="#f5c563" text-anchor="middle">3200</text>
  <rect x="220" y="330" width="200" height="46" rx="6" fill="#111318" stroke="#4a5164" stroke-width="2"/>
  <text x="320" y="362" font-family="Consolas, monospace" font-size="26" fill="#e7ebf3" text-anchor="middle" letter-spacing="4">ODO ${odo}</text>
  <text x="320" y="46" font-family="Arial" font-size="18" fill="#7a8296" text-anchor="middle">サンプル: 車両メーター写真</text>
</svg>`;
  return svgToDataUrl(svg);
}

export function sampleHygieneImage(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#eef2f7"/>
  <text x="320" y="40" font-family="Arial" font-size="18" fill="#5b6472" text-anchor="middle">サンプル: 衛生チェック写真(体温計 + アルコールチェッカー)</text>

  <rect x="70" y="90" width="220" height="240" rx="18" fill="#ffffff" stroke="#c7ceda" stroke-width="2"/>
  <rect x="150" y="120" width="60" height="140" rx="30" fill="#dfe5ee"/>
  <rect x="168" y="140" width="24" height="140" rx="12" fill="#6ee08a"/>
  <circle cx="180" cy="290" r="26" fill="#6ee08a"/>
  <rect x="90" y="270" width="180" height="46" rx="8" fill="#111827"/>
  <text x="180" y="300" font-family="Consolas, monospace" font-size="24" fill="#6ee08a" text-anchor="middle">36.4 ℃</text>

  <rect x="350" y="90" width="220" height="240" rx="18" fill="#ffffff" stroke="#c7ceda" stroke-width="2"/>
  <rect x="400" y="120" width="120" height="70" rx="10" fill="#dfe5ee"/>
  <rect x="440" y="190" width="40" height="60" fill="#c3cbd8"/>
  <rect x="370" y="250" width="200" height="46" rx="8" fill="#111827"/>
  <text x="470" y="280" font-family="Consolas, monospace" font-size="24" fill="#8fe0a0" text-anchor="middle">0.00 mg/L</text>
</svg>`;
  return svgToDataUrl(svg);
}

export function sampleRegistrationImage(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <rect width="640" height="420" fill="#f6f4ec"/>
  <rect x="24" y="24" width="592" height="372" rx="6" fill="#fffdf6" stroke="#b9ad86" stroke-width="3"/>
  <text x="320" y="60" font-family="Noto Sans JP, Arial" font-size="22" fill="#4a4530" text-anchor="middle">自動車検査証(サンプル)</text>
  <line x1="60" y1="80" x2="580" y2="80" stroke="#c9c0a0" stroke-width="1"/>
  <text x="60" y="120" font-family="Arial" font-size="15" fill="#6b6448">登録番号</text>
  <text x="60" y="146" font-family="Arial" font-size="20" fill="#2b2717">品川 300 あ 12-34</text>
  <text x="60" y="190" font-family="Arial" font-size="15" fill="#6b6448">車名・型式</text>
  <text x="60" y="216" font-family="Arial" font-size="20" fill="#2b2717">トヨタ ハイエース バン</text>
  <text x="60" y="260" font-family="Arial" font-size="15" fill="#6b6448">車台番号</text>
  <text x="60" y="286" font-family="Arial" font-size="20" fill="#2b2717">XZU710-1234567</text>
  <text x="60" y="330" font-family="Arial" font-size="15" fill="#6b6448">有効期間の満了する日</text>
  <text x="60" y="356" font-family="Arial" font-size="20" fill="#a83232">2026年10月14日</text>
  <rect x="470" y="260" width="90" height="90" fill="#efece0" stroke="#b9ad86"/>
  <text x="515" y="310" font-family="Arial" font-size="12" fill="#a39a72" text-anchor="middle">QRコード</text>
</svg>`;
  return svgToDataUrl(svg);
}
