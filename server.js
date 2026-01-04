import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const port = parseInt(process.env.PORT || '3000', 10)
const hostname = '0.0.0.0'
const dev = process.env.NODE_ENV !== 'production'

console.log(`> Starting server with PORT=${port}, NODE_ENV=${process.env.NODE_ENV}`)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    console.log(`> Request: ${req.method} ${req.url}`)
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  server.on('error', (err) => {
    console.error('> Server error:', err)
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Server listening, accepting connections...`)
  })
}).catch((err) => {
  console.error('> Failed to prepare Next.js app:', err)
  process.exit(1)
})
