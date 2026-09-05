const fs = require("fs");
const path = require("path");

function createPhoneSvg({ backColor, frameColor, screenGradient, isGalaxy, isPixel, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 480" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${backColor}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${backColor}" stop-opacity="0.95" />
      <stop offset="60%" stop-color="${backColor}" />
      <stop offset="100%" stop-color="#111827" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      ${screenGradient}
    </linearGradient>
    <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
    </linearGradient>
    <filter id="softShadow" x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="3" dy="16" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Ambient glow backdrop -->
  <rect width="500" height="480" rx="24" fill="#F8FAFC" />
  <circle cx="250" cy="240" r="210" fill="url(#bgGlow)" />

  <!-- Left Device: Back View -->
  <g transform="translate(80, 60)" filter="url(#softShadow)">
    <!-- Outer Frame / Titanium edge -->
    <rect x="0" y="0" width="168" height="348" rx="${isGalaxy ? '14' : '36'}" fill="${frameColor}" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.5" />
    <!-- Rear glass body -->
    <rect x="3" y="3" width="162" height="342" rx="${isGalaxy ? '12' : '34'}" fill="url(#bodyGrad)" />
    <rect x="3" y="3" width="162" height="342" rx="${isGalaxy ? '12' : '34'}" fill="url(#glassReflect)" />

    ${
      isGalaxy
        ? `
      <!-- Galaxy Camera Array (Vertical individual lenses) -->
      <g transform="translate(18, 24)">
        <circle cx="18" cy="18" r="16" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
        <circle cx="18" cy="18" r="10" fill="#1E293B" />
        <circle cx="15" cy="15" r="4" fill="#38BDF8" opacity="0.7" />

        <circle cx="18" cy="62" r="16" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
        <circle cx="18" cy="62" r="10" fill="#1E293B" />
        <circle cx="15" cy="59" r="4" fill="#38BDF8" opacity="0.7" />

        <circle cx="18" cy="106" r="16" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
        <circle cx="18" cy="106" r="10" fill="#1E293B" />
        <circle cx="15" cy="103" r="4" fill="#38BDF8" opacity="0.7" />

        <!-- Flash & Sensor -->
        <circle cx="52" cy="38" r="8" fill="#FEF08A" stroke="#E2E8F0" stroke-width="1.5" opacity="0.9" />
        <circle cx="52" cy="74" r="6" fill="#0F172A" stroke="${frameColor}" stroke-width="1.5" />
      </g>
    `
        : isPixel
        ? `
      <!-- Pixel Iconic Camera Bar -->
      <rect x="0" y="42" width="168" height="52" rx="16" fill="#1E293B" stroke="${frameColor}" stroke-width="2" />
      <rect x="16" y="54" width="90" height="28" rx="14" fill="#020617" />
      <circle cx="36" cy="68" r="9" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
      <circle cx="78" cy="68" r="9" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
      <circle cx="132" cy="68" r="6" fill="#FEF08A" />
    `
        : `
      <!-- iPhone Triple Pro Camera Plateau -->
      <rect x="12" y="16" width="92" height="96" rx="26" fill="${backColor}" filter="url(#softShadow)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1" />
      <circle cx="38" cy="42" r="17" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
      <circle cx="38" cy="42" r="10" fill="#1E293B" />
      <circle cx="34" cy="38" r="4" fill="#38BDF8" opacity="0.7" />

      <circle cx="38" cy="86" r="17" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
      <circle cx="38" cy="86" r="10" fill="#1E293B" />
      <circle cx="34" cy="82" r="4" fill="#38BDF8" opacity="0.7" />

      <circle cx="76" cy="64" r="17" fill="#0F172A" stroke="${frameColor}" stroke-width="2.5" />
      <circle cx="76" cy="64" r="10" fill="#1E293B" />
      <circle cx="72" cy="60" r="4" fill="#38BDF8" opacity="0.7" />

      <!-- LiDAR + True Tone Flash -->
      <circle cx="76" cy="30" r="7" fill="#FEF08A" stroke="#CBD5E1" stroke-width="1" opacity="0.9" />
      <circle cx="76" cy="98" r="5" fill="#090D16" />
    `
    }

    <!-- Brand Accent dot -->
    <circle cx="84" cy="195" r="12" fill="#FFFFFF" fill-opacity="0.2" />
  </g>

  <!-- Right Device: Front Screen View -->
  <g transform="translate(235, 75)" filter="url(#softShadow)">
    <!-- Frame -->
    <rect x="0" y="0" width="168" height="348" rx="${isGalaxy ? '14' : '36'}" fill="${frameColor}" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.5" />
    <!-- Black bezel -->
    <rect x="3" y="3" width="162" height="342" rx="${isGalaxy ? '12' : '34'}" fill="#090D16" />
    <!-- Screen wallpaper -->
    <rect x="7" y="7" width="154" height="334" rx="${isGalaxy ? '10' : '31'}" fill="url(#screenGrad)" />

    ${
      isGalaxy
        ? `
      <!-- Galaxy Punch hole camera -->
      <circle cx="84" cy="20" r="4" fill="#000000" stroke="#1E293B" stroke-width="1" />
    `
        : isPixel
        ? `
      <!-- Pixel Punch hole camera -->
      <circle cx="84" cy="20" r="4.5" fill="#000000" stroke="#334155" stroke-width="1" />
    `
        : `
      <!-- Dynamic Island pill -->
      <rect x="54" y="14" width="60" height="14" rx="7" fill="#000000" />
      <circle cx="102" cy="21" r="3" fill="#1E293B" />
    `
    }

    <!-- Sleek Lockscreen UI Overlay Elements -->
    <text x="84" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" fill-opacity="0.95" text-anchor="middle">09:41</text>
    <text x="84" y="84" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="500" fill="#FFFFFF" fill-opacity="0.8" text-anchor="middle">Wednesday, Sept 9</text>

    <!-- Bottom Home Bar -->
    <rect x="54" y="328" width="60" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.75" />
  </g>
</svg>`;
}

const VARIANTS = [
  {
    file: "iphone-17-pro-orange.svg",
    backColor: "#C96A34",
    frameColor: "#E68A4F",
    screenGradient: '<stop offset="0%" stop-color="#EA580C" /><stop offset="40%" stop-color="#831843" /><stop offset="100%" stop-color="#1E1B4B" />',
    isGalaxy: false,
    isPixel: false,
  },
  {
    file: "iphone-17-pro-silver.svg",
    backColor: "#E4E4E2",
    frameColor: "#D1D5DB",
    screenGradient: '<stop offset="0%" stop-color="#64748B" /><stop offset="50%" stop-color="#334155" /><stop offset="100%" stop-color="#0F172A" />',
    isGalaxy: false,
    isPixel: false,
  },
  {
    file: "iphone-17-pro-blue.svg",
    backColor: "#1F3A5F",
    frameColor: "#3B82F6",
    screenGradient: '<stop offset="0%" stop-color="#1D4ED8" /><stop offset="50%" stop-color="#1E293B" /><stop offset="100%" stop-color="#020617" />',
    isGalaxy: false,
    isPixel: false,
  },
  {
    file: "samsung-s24-ultra-black.svg",
    backColor: "#2B2B2B",
    frameColor: "#475569",
    screenGradient: '<stop offset="0%" stop-color="#334155" /><stop offset="50%" stop-color="#1E293B" /><stop offset="100%" stop-color="#0F172A" />',
    isGalaxy: true,
    isPixel: false,
  },
  {
    file: "samsung-s24-ultra-gray.svg",
    backColor: "#8A8A8A",
    frameColor: "#94A3B8",
    screenGradient: '<stop offset="0%" stop-color="#64748B" /><stop offset="50%" stop-color="#475569" /><stop offset="100%" stop-color="#1E293B" />',
    isGalaxy: true,
    isPixel: false,
  },
  {
    file: "google-pixel-9-pro-obsidian.svg",
    backColor: "#1A1A1A",
    frameColor: "#334155",
    screenGradient: '<stop offset="0%" stop-color="#10B981" /><stop offset="50%" stop-color="#047857" /><stop offset="100%" stop-color="#064E3B" />',
    isGalaxy: false,
    isPixel: true,
  },
  {
    file: "google-pixel-9-pro-porcelain.svg",
    backColor: "#EDE7DD",
    frameColor: "#CBD5E1",
    screenGradient: '<stop offset="0%" stop-color="#F59E0B" /><stop offset="50%" stop-color="#D97706" /><stop offset="100%" stop-color="#78350F" />',
    isGalaxy: false,
    isPixel: true,
  },
];

const imgDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

for (const v of VARIANTS) {
  const content = createPhoneSvg(v);
  fs.writeFileSync(path.join(imgDir, v.file), content, "utf8");
}

// Keep fallback filenames
fs.copyFileSync(path.join(imgDir, "iphone-17-pro-orange.svg"), path.join(imgDir, "iphone-17-pro.svg"));
fs.copyFileSync(path.join(imgDir, "samsung-s24-ultra-black.svg"), path.join(imgDir, "samsung-galaxy-s24-ultra.svg"));
fs.copyFileSync(path.join(imgDir, "samsung-s24-ultra-black.svg"), path.join(imgDir, "samsung-s24-ultra.svg"));
fs.copyFileSync(path.join(imgDir, "google-pixel-9-pro-obsidian.svg"), path.join(imgDir, "google-pixel-9-pro.svg"));

console.log("All product variant SVG images generated successfully!");
