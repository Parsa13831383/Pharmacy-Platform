import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import { getHomepageSettingsController, updateHomepageSettingsController } from './cms.controller'

export const adminCmsRouter = Router()

adminCmsRouter.use(authenticateAdmin)
adminCmsRouter.get('/homepage', getHomepageSettingsController)
adminCmsRouter.put('/homepage', updateHomepageSettingsController)

export const publicCmsRouter = Router()

publicCmsRouter.get('/homepage', getHomepageSettingsController)
