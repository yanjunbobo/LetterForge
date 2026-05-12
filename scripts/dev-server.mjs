import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".xml":"application/xml; charset=utf-8", ".txt":"text/plain; charset=utf-8" };

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  if (cleanUrl.startsWith("/word/") && cleanUrl !== "/word/") return path.join(root, "word", "index.html");
  let file = path.join(root, cleanUrl);
  if (cleanUrl.endsWith("/")) file = path.join(file, "index.html");
  if (existsSync(file) && !file.endsWith(path.sep)) return file;
  if (existsSync(path.join(file, "index.html"))) return path.join(file, "index.html");
  return path.join(root, "index.html");
}

createServer(async (req, res) => {
  try {
    const file = resolvePath(req.url || "/");
    const ext = path.extname(file);
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
}).listen(port, () => console.log(`LetterForge running at http://localhost:${port}`));
