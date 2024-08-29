const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

// const TWEMOJI_NAME = "twemoji_72";
const OPENMOJI_NAME = "openmoji_color_72";
const name = OPENMOJI_NAME;
const inputDir = `./${name}`; // directory containing the original images
const outputDir = `./${name}_cropped`; // directory to save the processed images
const failedDir = `./${name}_failed`; // directory to save the processed images
const padding = 1;
const targetSize = 72;

async function cropAndPadImage(imagePath, outputPath) {
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();
  const rawBuffer = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rawBuffer;
  const pixelArray = new Uint8Array(data);

  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;

  let foundNonOpaquePixel = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Alpha value is the 4th byte in the pixel set (RGBA = 4 bytes)
      const alpha = pixelArray[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        // non-opaque pixel found
        foundNonOpaquePixel = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!foundNonOpaquePixel) {
    console.log(`No non-opaque pixels found in ${imagePath}, skipping...`);
    return;
  }

  // Determine the crop region with padding
  minX = Math.max(minX - padding, 0);
  minY = Math.max(minY - padding, 0);
  maxX = Math.min(maxX + padding, width - 1);
  maxY = Math.min(maxY + padding, height - 1);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const maxSize = Math.max(cropWidth, cropHeight);

  // Make the crop region square
  const squareCrop = {
    left: Math.max(0, minX - Math.floor((maxSize - cropWidth) / 2)),
    top: Math.max(0, minY - Math.floor((maxSize - cropHeight) / 2)),
    width: maxSize,
    height: maxSize,
  };

  // Ensure the square crop doesn't go out of bounds
  if (squareCrop.left + squareCrop.width > width) {
    squareCrop.left = width - squareCrop.width;
  }
  if (squareCrop.top + squareCrop.height > height) {
    squareCrop.top = height - squareCrop.height;
  }

  try {
    let croppedImage = await image.extract(squareCrop);
    if (
      croppedImage.width !== targetSize ||
      croppedImage.height !== targetSize
    ) {
      croppedImage = croppedImage.resize(targetSize, targetSize);
    }
    await croppedImage.toFormat("png").toFile(outputPath); // Explicitly set format to PNG
  } catch (error) {
    console.log(squareCrop);
    const file = path.basename(imagePath);
    await fs.copy(imagePath, path.join(failedDir, file));
    console.error(`Error processing ${imagePath}: ${error}`);
  }
}

async function processDirectory(inputDir, outputDir) {
  await fs.ensureDir(outputDir);
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    if (path.extname(file).toLowerCase() === ".png") {
      // console.log(`Processing ${file}...`);
      await cropAndPadImage(inputPath, outputPath);
    }
  }
}

processDirectory(inputDir, outputDir)
  .then(() => console.log("All images processed."))
  .catch((err) => console.error(err));
