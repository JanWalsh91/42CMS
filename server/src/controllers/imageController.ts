import { Request, Response, NextFunction } from 'express'
import * as multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

import { ServerError, ValidationError } from '../utils'
import { imageService } from '../services/imageService'


const imageFieldName: string = 'image'
const imageDirectoryPath: string = '../../images/'
const imageDirectoryTmpPath: string = path.join(__dirname, '../../tmp_uploads/')
let storage = multer.diskStorage({
    destination: imageDirectoryTmpPath,
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
   })
const uploadImage = multer({
	storage: storage,
	fileFilter: function(req, file, callback) {
		let ext = path.extname(file.originalname)
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
			callback(new ValidationError('only images are allowed'), false)
		} else {
			callback(null, true)
		}
	}
}).single(imageFieldName)

export const imageController = {	
	
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ImageController] create'))
		const id: string = req.body.id
		const finalPath: string = imageDirectoryPath + req.file.filename
		const tmpPath: string = req.file ? req.file.path : undefined;

		try {
			await new Promise(resolve => {
				fs.rename(tmpPath, path.join(__dirname, finalPath), (err) => {
					if (err) {
						console.log(chalk.red(err.message))
						throw new ServerError(500, 'Failed to upload image')
					}
					resolve()
				})
			})
			await imageService.create(id, finalPath)
			res.end()
		} catch (e) { next(e) }
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
		console.log(chalk.magenta('[ImageController] upload image'))
		await uploadImage(req, res, next)
		console.log(chalk.magenta('[ImageController] upload image __END'))
	}
}