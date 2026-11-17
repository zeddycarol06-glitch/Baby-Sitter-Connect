import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
mkdirSync(join(root, "public/avatars"), { recursive: true });
mkdirSync(join(root, "public/documents"), { recursive: true });

const people = [
  { slug: "maya", from: "#14b8a6", to: "#0284c7", skin: "#e8b58b", hair: "#2f1b12", shirt: "#0f766e" },
  { slug: "elena", from: "#fb923c", to: "#e11d48", skin: "#d9a06b", hair: "#3b2112", shirt: "#9f1239" },
  { slug: "priya", from: "#a855f7", to: "#d946ef", skin: "#b97a4e", hair: "#1f1410", shirt: "#7e22ce" },
  { slug: "jordan", from: "#0ea5e9", to: "#4f46e5", skin: "#f0c9a2", hair: "#1b1613", shirt: "#1d4ed8" },
  { slug: "amara", from: "#10b981", to: "#0d9488", skin: "#8a5636", hair: "#170f0b", shirt: "#065f46" },
  { slug: "sophie", from: "#fb7185", to: "#c026d3", skin: "#f2cfad", hair: "#1d1410", shirt: "#be185d" },
  { slug: "noah", from: "#84cc16", to: "#0891b2", skin: "#f3c7a3", hair: "#7c4a21", shirt: "#3f6212" },
  { slug: "grace", from: "#06b6d4", to: "#059669", skin: "#ecc6a1", hair: "#231712", shirt: "#0f766e" },
  { slug: "alex", from: "#0d9488", to: "#2563eb", skin: "#e9bd96", hair: "#38231a", shirt: "#115e59" },
  { slug: "hannah", from: "#f59e0b", to: "#f43f5e", skin: "#f1c7a4", hair: "#5b3416", shirt: "#b45309" },
  { slug: "daniel", from: "#3b82f6", to: "#0e7490", skin: "#c78a5c", hair: "#15100d", shirt: "#1e40af" },
  { slug: "chloe", from: "#a78bfa", to: "#ec4899", skin: "#efc8a4", hair: "#221714", shirt: "#6d28d9" },
  { slug: "riley", from: "#0ea5e9", to: "#14b8a6", skin: "#e5b58b", hair: "#1f1712", shirt: "#0c4a6e" },
];

for (const person of people) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="Portrait illustration">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${person.from}" />
      <stop offset="100%" stop-color="${person.to}" />
    </linearGradient>
    <clipPath id="frame"><rect width="400" height="400" rx="0" /></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="400" height="400" fill="url(#bg)" />
    <circle cx="322" cy="76" r="120" fill="#ffffff" opacity="0.14" />
    <circle cx="52" cy="352" r="140" fill="#ffffff" opacity="0.1" />
    <path d="M60 400c8-86 66-134 140-134s132 48 140 134z" fill="${person.shirt}" opacity="0.92" />
    <path d="M148 268h104v58c0 22-23 38-52 38s-52-16-52-38z" fill="${person.skin}" />
    <ellipse cx="200" cy="186" rx="82" ry="94" fill="${person.skin}" />
    <path d="M118 176c-10-72 30-112 84-112 58 0 92 40 80 114-14-24-22-44-30-58-30 18-68 20-102 12-8 16-18 30-32 44z" fill="${person.hair}" />
    <circle cx="170" cy="190" r="6" fill="#2a1c15" opacity="0.8" />
    <circle cx="230" cy="190" r="6" fill="#2a1c15" opacity="0.8" />
    <path d="M182 224c10 9 26 9 36 0" fill="none" stroke="#8c5a44" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <path d="M152 160c8-6 18-8 28-5" fill="none" stroke="${person.hair}" stroke-width="5" stroke-linecap="round" opacity="0.75" />
    <path d="M220 155c10-3 20-1 28 5" fill="none" stroke="${person.hair}" stroke-width="5" stroke-linecap="round" opacity="0.75" />
  </g>
</svg>`;
  writeFileSync(join(root, "public/avatars", `${person.slug}.svg`), svg);
}

const documentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" role="img" aria-label="Sample verification document">
  <rect width="640" height="440" fill="#e7eef0" />
  <rect x="72" y="40" width="496" height="360" rx="14" fill="#ffffff" stroke="#cbd5d9" />
  <rect x="72" y="40" width="496" height="58" rx="14" fill="#0f766e" />
  <rect x="72" y="84" width="496" height="14" fill="#0f766e" />
  <text x="104" y="78" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" font-weight="bold">BABYSITTER CONNECT</text>
  <text x="104" y="140" font-family="Arial, sans-serif" font-size="14" fill="#64748b" letter-spacing="2">VERIFICATION DOCUMENT</text>
  <rect x="104" y="168" width="120" height="148" rx="8" fill="#e2e8f0" />
  <circle cx="164" cy="216" r="30" fill="#94a3b8" />
  <path d="M118 302c6-34 24-50 46-50s40 16 46 50z" fill="#94a3b8" />
  <text x="256" y="192" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="bold">Jordan A. Lee</text>
  <text x="256" y="220" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Date of birth · 05 / 12 / 1998</text>
  <text x="256" y="246" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Document no. · WA-4821-9930</text>
  <text x="256" y="272" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Expires · 05 / 12 / 2029</text>
  <rect x="256" y="292" width="260" height="10" rx="5" fill="#e2e8f0" />
  <rect x="256" y="314" width="210" height="10" rx="5" fill="#e2e8f0" />
  <rect x="104" y="346" width="412" height="1" fill="#e2e8f0" />
  <text x="104" y="376" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">Sample preview generated for the demo environment. No real personal data.</text>
</svg>`;
writeFileSync(join(root, "public/documents/sample-document.svg"), documentSvg);

const idSvg = documentSvg
  .replace("Jordan A. Lee", "Maya R. Thompson")
  .replace("05 / 12 / 1998", "08 / 19 / 1994")
  .replace("WA-4821-9930", "WA-7719-2214")
  .replace("05 / 12 / 2029", "08 / 19 / 2028");
writeFileSync(join(root, "public/documents/sample-id.svg"), idSvg);

console.log(`Generated ${people.length} avatars and 2 document previews.`);
