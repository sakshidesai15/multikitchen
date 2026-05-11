import { cp, rm, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendDist = path.resolve(backendRoot, "..", "frontend", "dist");
const publicDir = path.resolve(backendRoot, "public");

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
await cp(frontendDist, publicDir, { recursive: true });

console.log(`Copied frontend build from ${frontendDist} to ${publicDir}`);
