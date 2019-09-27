import chalk from 'chalk'

import { ResourceNotFoundError, NotImplementedError, ValidationError, Patchable, patchAction, patchRequest } from '../utils'
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

	public async create(id: string, path: string): Promise<IImage> {
		console.log(chalk.blue('[imageService.create]'), id)
		const existingImage: IImage = await this.getById(id)
		
		if (existingImage) {
			throw new ValidationError('Image already exists')
		}
		
		const image: IImage = await new Image({
			id,
			path,
		}).save()

		return image
	}

	public async delete(image: IImage): Promise<void> {
		console.log(chalk.blue('[imageService.delete]'))
		await image.remove()
	}
	
	private async setId(image: IImage, id: string): Promise<IImage> {
		console.log(chalk.magenta(`[ImageService.setId] ${id}`))
		image.id = id
		return image
	}

	public async getById(id: string): Promise<IImage> {
		return Image.findOne({id}).exec()
	}
}

export const imageService: ImageService = new ImageService();
