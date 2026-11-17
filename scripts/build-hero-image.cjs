const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "public", "images", "hero-care.svg");
const output = path.join(root, "public", "images", "hero-care.webp");

async function main() {
  const svg = await fs.readFile(input);
  await sharp(svg, { density: 220 })
    .resize(1440, 1080, { fit: "cover" })
    .webp({ quality: 88 })
    .toFile(output);
  const { size } = await fs.stat(output);
  console.log(`wrote ${output} (${Math.round(size / 1024)} kB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
