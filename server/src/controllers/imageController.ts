import { Request, Response, NextFunction } from 'express'
import * as multer from 'multer'
import chalk from 'chalk'

const imageFieldName: string = 'image'
const uploadImage = multer({ dest: './uploads/' }).single(imageFieldName)

export const imageController = {	
	
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ImageController] create'))
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ImageController] get'))
	},

	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ImageController] getAll'))
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ImageController] delete'))
	},

	async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
		await uploadImage(req, res, next)
	}
}