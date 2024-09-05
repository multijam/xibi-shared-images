import { promises as fs } from "fs";
import path from "path";
import favicons from "favicons";

async function makeIcons() {
  const srcPath = "./svg";
  const destPath = "./icons";
  const dir = await fs.readdir(srcPath);

  for (const file of dir) {
    const filePath = path.join(srcPath, file);
    if (path.extname(filePath) !== ".svg") {
      console.log("skipping", filePath);
      return;
    }
    try {
      // copy svg to dest
      const iconPath = path.join(destPath, file.replace(".svg", ""));
      await fs.copyFile(filePath, path.join(iconPath, "favicon.svg"));

      const response = await favicons(filePath, {
        icons: {
          android: false,
          appleIcon: ["apple-touch-icon-180x180.png"],
          appleStartup: false,
          favicons: true,
          windows: false,
          yandex: false,
        },
      });
      await fs.mkdir(iconPath, {
        recursive: true,
      });
      // await fs.mkdir(dest, { recursive: true });
      await Promise.all(
        response.images.map(
          async (image) =>
            await fs.writeFile(path.join(iconPath, image.name), image.contents)
        )
      );
    } catch (error) {
      console.log("file", filePath);
      console.log(error.message); // Error description e.g. "An unknown error has occurred"
    }
  }
  console.log("done");
}

makeIcons();
