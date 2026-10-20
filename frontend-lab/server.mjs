import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'dist')
const PORT = Number(process.env.PORT || 80)
const INDEX = path.join(ROOT, 'index.html')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type ?? 'text/plain; charset=utf-8' })
  res.end(body)
}

function serveFile(res, file, reqPath) {
  const ext = path.extname(file).toLowerCase()
  try {
    const data = fs.readFileSync(file)
    const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream' }
    // Cache lama untuk asset berversi (ada hash di nama file)
    if (reqPath.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    }
    res.writeHead(200, headers)
    res.end(data)
  } catch {
    send(res, 404, 'Not found')
  }
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const rel = safe.replace(/^\//, '')
  const file = path.join(ROOT, rel)

  // Cegah path traversal keluar dari dist/
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden')

  try {
    const stat = fs.statSync(file)
    if (stat.isDirectory()) {
      const indexInDir = path.join(file, 'index.html')
      if (fs.existsSync(indexInDir)) return serveFile(res, indexInDir, urlPath)
      return serveFile(res, INDEX, urlPath)
    }
    if (stat.isFile()) return serveFile(res, file, urlPath)
  } catch {
    // File tidak ada: asset -> 404, route SPA -> index.html
    if (urlPath.startsWith('/assets/')) return send(res, 404, 'Not found')
    return serveFile(res, INDEX, urlPath)
  }
})

server.listen(PORT, () => {
  console.log(`frontend-lab serve ${ROOT} on :${PORT}`)
})
