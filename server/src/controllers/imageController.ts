import { Request, Response, NextFunction } from 'express'
import * as multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'

import { ServerError, ValidationError, NotImplementedError, ResourceNotFoundError } from '../utils'
import { imageService } from '../services/imageService'
import { IImage } from '../interfaces'

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
		const id: string = req.body.id
		const finalPath: string = imageDirectoryPath + req.file.filename
		const tmpPath: string = req.file ? req.file.path : undefined;

		try {
			await new Promise(resolve => {
				fs.rename(tmpPath, path.join(__dirname, finalPath), (err) => {
					if (err) {
						throw new ServerError(500, 'Failed to upload image')
					}
					resolve()
				})
			})
			await imageService.create(id, finalPath)
			res.end()
		} catch (e) {
			if (fs.existsSync(path.join(__dirname, finalPath))) {
				fs.unlinkSync(path.join(__dirname, finalPath))
			}
			next(e)
		}
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		throw new NotImplementedError()
	},

	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		throw new NotImplementedError()
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await imageService.delete(res.locals.image)
			res.end()
		} catch (e) { next(e) }
	},

	async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
		await uploadImage(req, res, next)
	},

	async setImageFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.imageid) {
			return next(new ValidationError('Image id not provided'))
		}
		const image: IImage = await imageService.getById(req.params.imageid)
		if (!image) {
			return next(new ResourceNotFoundError('Image', req.params.imageid))
		}
		res.locals.image = image
		next()
	},
}