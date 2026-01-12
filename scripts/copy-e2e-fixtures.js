const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "client", "src", "test", "e2e", "fixtures");
const outDir = path.join(__dirname, "..", "client", "out", "test", "e2e", "fixtures");

// Create output directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy all files from src to out
try {
  fs.readdirSync(srcDir).forEach(file => {
    const srcFile = path.join(srcDir, file);
    const outFile = path.join(outDir, file);
    fs.copyFileSync(srcFile, outFile);
    console.log(`Copied: ${file}`);
  });
  console.log("E2E fixtures copied successfully");
} catch (error) {
  console.error("Error copying E2E fixtures:", error);
  process.exit(1);
}
