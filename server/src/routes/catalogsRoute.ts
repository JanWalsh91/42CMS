import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { catalogController } from '../controllers/catalogController'
import { ICatalog, Catalog } from '../models/catalogModel'
import categories from './categoriesRoute'

const router: Router = Router()

router
	.use('/:catalogid/categories/', categories)
	.get('/:catalogid', catalogController.get)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

export default router