// Generates the site-wide default social preview card at public/og/default.png.
//
// Why a script and not a checked-in binary: an image nobody can regenerate is a
// mystery asset. Run `node scripts/og-default.mjs` after changing the palette or
// the tagline and the card follows.
//
// 1200x630 is the size every scraper wants. LinkedIn, Slack and Facebook all read
// og:image; LinkedIn caps at 5MB and prefers at least 1200x627, so this clears it.
//
// Text is rendered by librsvg through sharp, which uses SYSTEM fonts, not the web
// fonts the site loads from Google. So the stack below is deliberately boring and
// resolvable on any machine that runs this. Per-post cards in phase 2 will use a
// real font pipeline; this one only has to be correct and on-brand.

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { SITE } from '../src/consts.ts';

const W = 1200;
const H = 630;

// Straight from public/assets/style.css :root. Keep them in step by hand; there is
// one card and it is not worth a CSS parser.
const INK = '#0a0e14';
const INK2 = '#14222f';
const CYAN = '#36e0ff';
const TEAL = '#0a6c80';
const PAPER = '#faf9f5';
const MUTED = '#6f8398';

const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Cascadia Mono', Consolas, 'Courier New', monospace";

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="${INK2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="${CYAN}" stroke-width="1" opacity="0.05"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- Aperture mark, same geometry as the favicon so the tab icon and the share
       card are recognisably the same thing. -->
  <g transform="translate(88, 88)">
    <circle cx="34" cy="34" r="30" fill="none" stroke="${TEAL}" stroke-width="7"/>
    <circle cx="34" cy="34" r="11" fill="${CYAN}"/>
  </g>

  <text x="176" y="132" font-family="${MONO}" font-size="21" letter-spacing="4.6"
        fill="${CYAN}" opacity="0.92">DAVIDCBERRY.COM</text>

  <text x="88" y="316" font-family="${SANS}" font-size="92" font-weight="700"
        letter-spacing="-2.4" fill="${PAPER}">${esc(SITE.author)}</text>

  <rect x="88" y="360" width="104" height="5" fill="${CYAN}"/>

  <text x="88" y="432" font-family="${SANS}" font-size="35" font-weight="500"
        fill="${MUTED}">Engineering educator. Infrastructure operator.</text>
  <text x="88" y="482" font-family="${SANS}" font-size="35" font-weight="500"
        fill="${MUTED}">AI governance in practice.</text>

  <text x="88" y="566" font-family="${MONO}" font-size="19" letter-spacing="2.2"
        fill="${TEAL}">SECURITY  ·  AI GOVERNANCE  ·  CAREER</text>

  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${CYAN}"/>
</svg>`;

await mkdir(new URL('../public/og/', import.meta.url), { recursive: true });

const out = new URL('../public/og/default.png', import.meta.url);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out.pathname.slice(1));

// Keep the source next to the output so a future edit does not start by reverse
// engineering the PNG.
await writeFile(new URL('../public/og/default.svg', import.meta.url), svg, 'utf8');

console.log(`wrote public/og/default.png  ${W}x${H}`);
