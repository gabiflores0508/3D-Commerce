type Variant = 'filament' | 'resin' | 'printer' | 'accessory' | 'ready' | 'generic';

const palettes: Record<Variant, [string, string, string]> = {
  filament: ['#0F1115', '#22D3EE', '#FAFAF7'],
  resin: ['#1F2329', '#A78BFA', '#F4F4F0'],
  printer: ['#0F1115', '#475569', '#FAFAF7'],
  accessory: ['#2A2D33', '#22D3EE', '#FAFAF7'],
  ready: ['#1F2329', '#F59E0B', '#FAFAF7'],
  generic: ['#0F1115', '#22D3EE', '#FAFAF7'],
};

export function productSvg(
  label: string,
  variant: Variant = 'generic',
  seed = 0,
): string {
  const [bg, accent, fg] = palettes[variant];
  const r1 = 30 + ((seed * 37) % 80);
  const r2 = 50 + ((seed * 71) % 100);
  const initials = label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="r${seed}" cx="0.7" cy="0.3" r="0.7">
      <stop offset="0%" stop-color="${fg}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${fg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g${seed})"/>
  <rect width="600" height="600" fill="url(#r${seed})"/>
  <g opacity="0.18" stroke="${fg}" stroke-width="1.4" fill="none">
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="300" cy="300" r="${40 + i * 28}" />`).join('')}
  </g>
  <g transform="translate(300 300)" opacity="0.92">
    <polygon points="-110,-60 110,-60 130,0 0,80 -130,0" fill="${fg}" opacity="0.08"/>
    <polygon points="-90,-50 90,-50 105,0 0,60 -105,0" fill="none" stroke="${fg}" stroke-width="2"/>
    <circle cx="${r1 - 60}" cy="${r2 - 70}" r="6" fill="${accent}"/>
    <circle cx="${-r1 + 30}" cy="${-r2 + 80}" r="4" fill="${fg}" opacity="0.6"/>
  </g>
  <text x="50%" y="54%" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="92" font-weight="700" fill="${fg}" opacity="0.95">${initials}</text>
  <text x="50%" y="86%" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="600" letter-spacing="3" fill="${fg}" opacity="0.7">3DCOMMERCE</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function bannerSvg(title: string, seed = 0, palette: [string, string] = ['#0F1115', '#22D3EE']): string {
  const [a, b] = palette;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#bg${seed})"/>
  <g opacity="0.15" stroke="#FAFAF7" stroke-width="1" fill="none">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="1600" y2="${i * 50 - 200}" />`).join('')}
  </g>
  <text x="80" y="320" font-family="Space Grotesk, Inter, sans-serif" font-size="72" font-weight="700" fill="#FAFAF7">${title}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
