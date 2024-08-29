const fs = require("fs");
const path = require("path");

async function lowercaseExtensions() {
  const dirPath = ".";
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const extension = path.extname(file);
      const newFileName = file.replace(extension, extension.toLowerCase());
      const newFilePath = path.join(dirPath, newFileName);

      fs.renameSync(filePath, newFilePath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
        }
      });
    });
  });
}

lowercaseExtensions();

async function renameNotoFiles() {
  const dirPath = "./noto_color_svg";
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const newFileName = file.replace("emoji_u", "").toUpperCase();
      const newFilePath = path.join(dirPath, newFileName);

      fs.renameSync(filePath, newFilePath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
        }
      });
    });
  });
}

async function renameTwemojiFiles() {
  const dirPaths = ["./twemoji_72", "./twemoji_72_cropped", "./twemoji_svg"];
  for (const dirPath of dirPaths) {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const newFileName = file.toUpperCase();
        const newFilePath = path.join(dirPath, newFileName);

        fs.renameSync(filePath, newFilePath, (err) => {
          if (err) {
            console.error("Error renaming file:", err);
          }
        });
      });
    });
  }
}

// renameTwemojiFiles();
// renameFiles();
