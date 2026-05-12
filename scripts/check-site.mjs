import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = ["index.html", "anagram-solver/index.html", "word-finder/index.html", "wordle-solver/index.html", "dictionary-checker/index.html", "random-word-generator/index.html", "sitemap.xml", "robots.txt"];
const missing = [];
for (const file of required) {
  try { await stat(path.join(root, file)); } catch { missing.push(file); }
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(full));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const bad = [];
for (const file of await htmlFiles(root)) {
  const html = await readFile(file, "utf8");
  for (const token of ["<title>", "meta name=\"description\"", "rel=\"canonical\"", "<h1", "FAQPage"]) {
    if (!html.includes(token)) bad.push(`${path.relative(root, file)} missing ${token}`);
  }
}

if (missing.length || bad.length) {
  console.error([...missing.map((m) => `Missing ${m}`), ...bad].join("\n"));
  process.exit(1);
}
console.log("Site check passed.");
