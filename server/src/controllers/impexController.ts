import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import * as path from 'path'

import { ValidationError, UnauthorizedError, LoginError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors'
import { impexService } from '../services';
import { impexRoute } from '../services/impexService';

export const impexController = {

	// Get list of files in impex
	async getAll(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.getAll]'))

		const filenames: string[] = await impexService.getAllFilesnames()
		res.send(filenames)
	},

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

	},

	// Uploads a file in impex
	async upload(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.upload]'))
	},

	// Exports one or more Collections as XML into impex/
	async export(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.export]'))
	},

	// Imports one or more Collections as XML into impex/
	async import(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.import]'))
	},

	// Delete a file from impex/
	async delete(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[ImpexController.delete]'))
	},
}