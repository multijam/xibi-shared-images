const baseUrl = "https://autocrop.cncf.io/autocrop";
const rp = require("request-promise");

const fs = require("fs-extra");
const path = require("path");

const OPENMOJI_NAME = "openmoji_color_svg";
const name = OPENMOJI_NAME;

const inputDir = `./${name}`; // directory containing the original images
const outputDir = `./${name}_cropped`; // directory to save the processed images
const fail_log = `./fail_log.txt`;
const success_log = `./success_log.txt`;

async function cropSvg(svg, title) {
  const response = await rp({
    method: "POST",
    body: { svg, title },
    uri: baseUrl,
    json: true,
  });
  console.info(response.success);
  if (!response.success) {
    fs.appendFileSync(fail_log, `${title}\n`);
    return false;
  }
  fs.appendFileSync(success_log, `${title}\n`);
  return response.result;
}

async function processDirectory(inputDir, outputDir) {
  await fs.ensureDir(outputDir);
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    if (path.extname(file).toLowerCase() !== ".svg") {
      continue;
    }
    const svg = await fs.readFile(inputPath, "utf8");
    const new_svg = await cropSvg(svg, file);
    if (new_svg) {
      await fs.writeFile(outputPath, new_svg);
    }
  }
}

processDirectory(inputDir, outputDir)
  .then(() => console.log("All images processed."))
  .catch((err) => console.error(err));
