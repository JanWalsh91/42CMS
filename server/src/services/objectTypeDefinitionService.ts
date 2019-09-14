import chalk from 'chalk'

import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError } from '../utils'
import { ObjectTypeDefinition, Product } from '../models'
import { Model, model, SchemaType } from 'mongoose'
import { attributeType } from '../types';
import { objectAttributeDefinitionService } from '.';

// const defaultObjectTypeDefinitions: Record<string, jsonDefaultObjectTypeDefinition> = require('../src/resources/defaultObjectTypeDefinitions')

class ObjectTypeDefinitionService extends Patchable {
	patchMap = {
		objectAttributeDefinitions: {
			$add: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['path', 'type'])
				await this.addObjectAttributeDefinition(action.resources.objectTypeDefinition, {
					path: action.path,
					type: action.type,
					localizable: action.localizable || true,
				})
			},
			$remove: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$remove]'))
				this.checkRequiredProperties(action, ['path'])
				await this.removeObjectAttributeDefinition(action.resources.objectTypeDefinition, action.path)
			},
		}
	}

	static defaultModels: Model<any>[] = [ Product ]

	public async update(objectTypeDefinitions: IObjectTypeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectTypeDefinition> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.update]`))

		if (resources.objectAttributeDefinition) {
			await objectAttributeDefinitionService.update(resources.objectAttributeDefinition, patchRequest, resources)
			objectTypeDefinitions.markModified('objectAttributeDefinitions')
		} else {
			await this.patch(patchRequest, resources)
		}
		
		return await objectTypeDefinitions.save() 
	}

	public async getById(objecttype: string): Promise<IObjectTypeDefinition> {
		return ObjectTypeDefinition.findOne({objectName: objecttype}).exec()
	}

	public async reset(models?: Model<any>[]): Promise<void> {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.reset]'))
		if (!models || !models.length) {
			models = ObjectTypeDefinitionService.defaultModels
		}
		console.log(chalk.magenta('Reseting ' + models.map((x: Model<any>) => x.modelName).join(', ')))
		await Promise.all(models.map(async (model: Model<any>) => {
			// TODO: remove objectAttributeDefinitons
			await ObjectTypeDefinition.find({objectName: model.modelName}).remove()
		}))
		console.log(chalk.magenta('[ObjectTypeDefinitionService.reset] -- END'))

	}

	public async init(models?: Model<any>[]): Promise<void> {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.init]'))

		// get models for which to create object type definitions
		if (!models || !models.length) {
			models = ObjectTypeDefinitionService.defaultModels
		}

		await Promise.all(models.map(async (model: Model<any>) => {

			// only create if doesn't exist
			if (await ObjectTypeDefinition.findOne({objectName: model.modelName})) {
				return 	
			}

			// create new ObjectTypeDefinition
			let OTD: IObjectTypeDefinition = new ObjectTypeDefinition({
				objectName: model.modelName,
				objectAttributeDefinitions: [],
			})
			
			model.schema.eachPath((pathName: string) => {
				// ignore non system attribute
				if (pathName.includes('custom')) {
					return
				}
				const path: any = model.schema.path(pathName)
				// add LocalizableAttributes to ObjectTypeDefinition
				if (path.instance && path.instance && path.instance && path.instance == 'ObjectID' && path.options && path.options && path.options.ref == 'LocalizableAttributeSchema') {
					OTD.addObjectAttributeDefinition({
						type: path.options.defaultType,
						path: pathName,
						system: true,
						localizable: true,
					})
				}
			})
			return OTD.save()
		}))

		console.log(chalk.magenta('[ObjectTypeDefinitionService.init] -- END'))

	}

	private async addObjectAttributeDefinition(objectTypeDefinition: IObjectTypeDefinition, config: {path: string, type: attributeType, localizable: boolean}): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.addObjectAttributeDefinition]`))
		if (objectTypeDefinition.objectAttributeDefinitions.find(x => x.path == config.path)) {
			throw new ValidationError(`Path ${config.path} already exists for object ${objectTypeDefinition.objectName}`)
		}
		objectTypeDefinition.objectAttributeDefinitions.push({
			...config,
			system: false,
		})
		objectTypeDefinition.markModified('objectAttributeDefinitions')
	}

	private async removeObjectAttributeDefinition(objectTypeDefinition: IObjectTypeDefinition, path: string): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.removeObjectAttributeDefinition]`))
		if (!objectTypeDefinition.objectAttributeDefinitions.find(x => x.path == path)) {
			throw new ValidationError(`Path ${path} does not exist for object ${objectTypeDefinition.objectName}`)
		}
		objectTypeDefinition.objectAttributeDefinitions = objectTypeDefinition.objectAttributeDefinitions.filter(x => x.path != path)
		objectTypeDefinition.markModified('objectAttributeDefinitions')
	}
}

export const objectTypeDefinitionService: ObjectTypeDefinitionService = new ObjectTypeDefinitionService()