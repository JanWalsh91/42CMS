import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import * as path from 'path'
import * as xlmbuilder from 'xmlbuilder'
import * as fs from 'fs'

import { ValidationError, UnauthorizedError, LoginError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors'
import { impexService, catalogService, productService } from '../services';
import { impexRoute } from '../services/impexService';

class ImpexController {

	// Get list of files in impex
	async getAll(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.getAll]'))

		const filenames: string[] = await impexService.getAllFilesnames()
		res.send(filenames)
	}

	// Downloads a file in impex
	async download(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.download]'))

		const filename: string = req.params.filename
		
		if (!filename) {
			throw new ValidationError('No filename provided')
		}

		res.download(path.join(impexRoute, filename), (err: Error) => {
			if (err && !res.headersSent) {
				throw err
			}
		})
	}

	// Uploads a file in impex
	async upload(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.upload]'))

		
		
		res.end()
	}
	
	// Exports one or more Collections as XML into impex/
	public export = async (req: Request, res: Response, next: NextFunction) => {
		console.log(chalk.magenta('[ImpexController.export]'))
		
		let types: string[] = req.body.types
		const filename: string = req.body.filename

		if (!types) {
			throw new ValidationError('types not provided')
		}
		if (!Array.isArray(types) || types.some(x => typeof x !== 'string')) {
			throw new ValidationError('types must be an array of string')
		}
		if (!filename) {
			throw new ValidationError('filename not provided')
		}
		if (typeof filename != 'string') {
			throw new ValidationError('filename must be a string')
		}

		var root: { catalogs?: any, procuct?: any } = {}

		// Get types
		types = types.map(x => x.toLowerCase())
		if (types.includes('catalog') || types.includes('catalogs')) {
			var catalogs: any = await catalogService.exportAllCatalogs()
			root.catalogs = catalogs
		}
		// if (types.includes('product') || types.includes('products')) {
			// 	let products = await productService.exportAllProducts()
			// }

		console.log('\n')

		let xml = xlmbuilder.create(root)

		console.log('\n')

		console.log(chalk.yellow('POST XML CREATION: '))

		console.log(xml.end({pretty: true}).toString())

		fs.writeFileSync(path.join(impexRoute, filename), xml.end({pretty: true}))

		res.end()
	}

	// Imports one or more Collections as XML into impex/
	async import(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.import]'))
	}

	// Delete a file from impex/
	async delete(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.delete]'))
	}
}

export const impexController: ImpexController = new ImpexController()