import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Standard way to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level from 'scripts' to root, then into 'public'
const swPath = path.join(__dirname, "..", "public", "sw.js");

try {
  console.log("🧹 Cleaning sw.js...");

  if (fs.existsSync(swPath)) {
    let content = fs.readFileSync(swPath, "utf8");

    // This regex finds and removes the problematic manifest lines
    const regex =
      /\{"url":"\/_next\/static\/[^"]+\/_(buildManifest|ssgManifest)\.js","revision":"[^"]+"\},?/g;

    const newContent = content.replace(regex, "");

    fs.writeFileSync(swPath, newContent);
    console.log("✅ Successfully removed broken manifest entries from sw.js");
  } else {
    console.warn(
      "⚠️ sw.js not found. Skipping cleanup (Local dev might not have generated it yet)."
    );
  }
} catch (error) {
  console.error("❌ Error cleaning sw.js:", error);
}
