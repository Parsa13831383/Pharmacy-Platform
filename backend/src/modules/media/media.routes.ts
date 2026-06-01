import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import { productImageUpload, promotionImageUpload } from '../../lib/multer'
import * as ctrl from './media.controller'

const router = Router()

router.use(authenticateAdmin)

// ─── Product images ───────────────────────────────────────────────────────────
router.get('/products/:productId', ctrl.listProductImages)
router.post('/products/:productId', productImageUpload.single('image'), ctrl.uploadProductImage)
router.delete('/products/:productId/images/:imageId', ctrl.deleteProductImage)
router.patch('/products/:productId/images/:imageId/primary', ctrl.setPrimaryProductImage)

// ─── Promotion images ─────────────────────────────────────────────────────────
router.get('/promotions/:promotionId', ctrl.listPromotionImages)
router.post('/promotions/:promotionId', promotionImageUpload.single('image'), ctrl.uploadPromotionImage)
router.delete('/promotions/:promotionId/images/:imageId', ctrl.deletePromotionImage)

export default router
