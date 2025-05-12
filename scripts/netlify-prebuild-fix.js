/**
 * This script fixes native module dependencies for Netlify build environments
 * It ensures all required platform-specific binaries are properly installed
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// List of native module dependencies needed for Linux x64 GNU (Netlify build environment)
const nativeModules = [
  "@rollup/rollup-linux-x64-gnu",
  "lightningcss-linux-x64-gnu",
  "@tailwindcss/oxide-linux-x64-gnu",
  "@esbuild/linux-x64", // Added esbuild native dependency
];

console.log("🚀 Running Netlify prebuild fix for native modules...");

// Install native modules
try {
  for (const module of nativeModules) {
    console.log(`📦 Installing ${module}...`);
    execSync(`npm install -f ${module}`, { stdio: "inherit", cwd: rootDir });
  }

  // Fix Tailwind CSS specific issues
  // Some environments need a symlink or copy of the binary file
  const tailwindOxidePath = join(
    rootDir,
    "node_modules",
    "@tailwindcss",
    "oxide"
  );
  if (existsSync(tailwindOxidePath)) {
    console.log("🔧 Setting up Tailwind CSS Oxide binaries...");
    try {
      // Create any necessary symlinks or fixes here
      execSync(
        `node -e "
        const fs = require('fs');
        const path = require('path');
        
        // Check if we need to create a symlink for the tailwind binary
        const oxidePath = path.join('${tailwindOxidePath}');
        const sourceFile = path.join(oxidePath, 'tailwindcss-oxide.linux-x64-gnu.node');
        const targetFile = path.join(oxidePath, 'node_modules', '@tailwindcss', 'oxide-linux-x64-gnu', 'tailwindcss-oxide.linux-x64-gnu.node');
        
        if (!fs.existsSync(sourceFile) && fs.existsSync(targetFile)) {
          console.log('Creating symlink for tailwind binary');
          fs.symlinkSync(targetFile, sourceFile);
        }
      "`,
        { stdio: "inherit" }
      );
    } catch (error) {
      console.warn(
        "⚠️ Warning: Unable to create symlinks. Continuing anyway:",
        error.message
      );
    }
  }

  // Fix esbuild native module detection
  const esbuildPath = join(rootDir, "node_modules", "esbuild");
  if (existsSync(esbuildPath)) {
    console.log("🔧 Setting up esbuild binaries...");
    try {
      // Create any necessary directories or copies
      execSync(
        `node -e "
        const fs = require('fs');
        const path = require('path');
        
        // Check esbuild binary paths
        const esbuildPath = path.join('${esbuildPath}');
        const esbuildBinPath = path.join(esbuildPath, 'bin', 'esbuild');
        const esbuildNativeModulePath = path.join(esbuildPath, 'node_modules', '@esbuild', 'linux-x64');
        
        // Ensure esbuild directories exist
        if (!fs.existsSync(path.dirname(esbuildNativeModulePath))) {
          fs.mkdirSync(path.dirname(esbuildNativeModulePath), { recursive: true });
        }
        
        // If we installed the native module manually via npm, make sure esbuild can find it
        const installedEsbuildPath = path.join('${rootDir}', 'node_modules', '@esbuild', 'linux-x64');
        if (fs.existsSync(installedEsbuildPath) && !fs.existsSync(esbuildNativeModulePath)) {
          console.log('Creating esbuild native module symlink');
          fs.symlinkSync(installedEsbuildPath, esbuildNativeModulePath);
        }
      "`,
        { stdio: "inherit" }
      );
    } catch (error) {
      console.warn(
        "⚠️ Warning: Unable to set up esbuild symlinks. Continuing anyway:",
        error.message
      );
    }
  }

  console.log("✅ Prebuild fix completed successfully!");
} catch (error) {
  console.error("❌ Prebuild fix encountered an error:", error.message);
  console.log("⚠️ Continuing with the build anyway...");
  // Don't exit with error code, let the build continue
}
