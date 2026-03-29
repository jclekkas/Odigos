import sharp from 'sharp';

const ORANGE = '#f97316';
const BG = '#fdf8f3';

function makeSvg(size) {
  const fontSize = Math.round(size * 0.72);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="600"
    font-size="${fontSize}"
    fill="${ORANGE}"
  >O</text>
</svg>`;
}

const sizes = [
  { size: 32, output: 'client/public/favicon.png' },
  { size: 180, output: 'client/public/apple-touch-icon.png' },
  { size: 192, output: 'client/public/icon-192.png' },
  { size: 512, output: 'client/public/icon-512.png' },
];

for (const { size, output } of sizes) {
  const svg = makeSvg(size);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(output);
  console.log(`Generated ${output} (${size}x${size})`);
}
