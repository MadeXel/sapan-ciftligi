// Copies the web game into www/ for Capacitor. The same index.html runs on the web (GitHub Pages) and in the apps.
import { rmSync, mkdirSync, cpSync } from "node:fs";
rmSync("www", { recursive: true, force: true });
mkdirSync("www");
for (const f of ["index.html", "manifest.json", "icons", "img"]) cpSync(f, `www/${f}`, { recursive: true });
console.log("www/ hazır");
