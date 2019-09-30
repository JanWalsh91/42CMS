import { Router, Request, Response } from 'express'

import users from './usersRoute'
import login from './loginRoute'
import logout from './logoutRoute'
import auth from './authRoute'
import catalogs from './catalogsRoute'
import products from './productsRoute'
import globalSettings from './globalSettingsRoute'
import locales from './localesRoute'
import objectTypeDefintions from './objectTypeDefinitionsRoute'
import images from './imagesRoute'
import sites from './sitesRoute'

import authorize from '../middleware/authorize'

const router: Router = Router({ mergeParams: true })

router.get('/', (req: Request, res: Response) => {
	res.status(200).send({
		message: 'GET request successfulll!!!!'
	})
})

router.use('/auth', auth)
router.use('/login', login)
router.use('/logout', logout)

router.use('/users', users)

router.use('/catalogs', authorize, catalogs)
router.use('/products', authorize, products)
router.use('/globalsettings', authorize, globalSettings)
router.use('/locales', authorize, locales)
router.use('/objecttypedefintions', authorize, objectTypeDefintions)
router.use('/images', authorize, images)
router.use('/sites', authorize, sites)

export default router