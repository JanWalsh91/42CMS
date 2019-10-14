import * as path from 'path'
import * as fs from 'fs'
const readChunk = require('read-chunk')
const imageType = require('image-type')

import { ValidationError, Patchable, patchAction } from '../utils'
import { IImage } from '../interfaces'
import { Image } from '../models'
import { objectTypeDefinitionService } from '.'

class ImageService extends Patchable<IImage> {
	hasObjectTypeDefinition = true
	protected async getObjectTypeDefinition() {
		return objectTypeDefinitionService.getById('Image')
	}

	protected patchMap = {
		id: {
			$set: async(image: IImage, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setId(image, action.value)
			},
		}
	}

	public async create(id: string, imgpath: string): Promise<IImage> {
		const existingImage: IImage = await this.getById(id)
		
		if (existingImage) {
			throw new ValidationError('Image already exists')
		}
		
		const buffer = readChunk.sync(path.join(__dirname, imgpath), 0, 12)
		if (!imageType(buffer)) {
			throw new ValidationError('File is not an image')
		}

		const image: IImage = await new Image({
			id,
			path: imgpath,
		}).save()

		return image
	}

	public async delete(image: IImage): Promise<void> {
		fs.unlinkSync(path.join(__dirname, image.path))
		await image.remove()
	}
	
	private async setId(image: IImage, id: string): Promise<IImage> {
		const images: IImage[] = await Image.find({id})
		if (images.length > 0) {
			throw new ValidationError(`Image with id ${id} already exists`)
		}
		image.setId(id)
		return image
	}

	public async getById(id: string): Promise<IImage> {
		return Image.findOne({id}).exec()
	}
}

export const imageService: ImageService = new ImageService()
