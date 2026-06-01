import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'

const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function createUpload(subDir: string) {
  const destination = path.join(process.cwd(), 'uploads', subDir)
  ensureDir(destination)

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${randomUUID()}${ext}`)
    },
  })

  return multer({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      if (ALLOWED_MIMETYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    },
  })
}

export const productImageUpload = createUpload('products')
export const promotionImageUpload = createUpload('promotions')
