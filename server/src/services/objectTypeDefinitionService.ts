import chalk from 'chalk'

import { IObjectTypeDefinition, IObjectAttributeDefinition, IExtensibleObject } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError, InternalError } from '../utils'
import { ObjectTypeDefinition, Product, LocalizableAttribute, ObjectAttributeDefinition, Image, Site } from '../models'
import { Model, model } from 'mongoose'
import { objectAttributeDefinitionService } from '.'

// const defaultObjectTypeDefinitions: Record<string, jsonDefaultObjectTypeDefinition> = require('../src/resources/defaultObjectTypeDefinitions')

class ObjectTypeDefinitionService extends Patchable<IObjectTypeDefinition> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	
	patchMap = {
		objectAttributeDefinitions: {
			$add: async(objectTypeDefinition: IObjectTypeDefinition, action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['path', 'type'])
				await this.addNewObjectAttributeDefinition(objectTypeDefinition,
					action.path,
					action.type,
					action.localizable || true,
				)
			},
			$remove: async(objectTypeDefinition: IObjectTypeDefinition, action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$remove]'))
				this.checkRequiredProperties(action, ['path'])
				await this.removeObjectAttributeDefinition(objectTypeDefinition, action.path)
			},
		}
	}

	static defaultModels: Model<any>[] = [ Product, Image, Site ]

	public async update(objectTypeDefinition: IObjectTypeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectTypeDefinition> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.update]`))

		if (resources.objectAttributeDefinition) {
			await objectAttributeDefinitionService.update(resources.objectAttributeDefinition, patchRequest, resources)
			objectTypeDefinition.markModified('objectAttributeDefinitions')
		} else {
			await this.patch(objectTypeDefinition, patchRequest, resources)
		}
		
		return await objectTypeDefinition.save() 
	}

	public async getById(objecttype: string): Promise<IObjectTypeDefinition> {
		return ObjectTypeDefinition.findOne({objectName: objecttype}).exec()
	}

	public async getByDocument(doc: IExtensibleObject): Promise<IObjectTypeDefinition> {
		return doc.getObjectTypeDefinition()
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

		// await Promise.all(models.map(async (model: Model<any>) => {
		for (let model of models) {

			// only create if doesn't exist
			if (await ObjectTypeDefinition.findOne({objectName: model.modelName})) {
				return 	
			}

			// create new ObjectTypeDefinition
			let OTD: IObjectTypeDefinition = await new ObjectTypeDefinition({
				objectName: model.modelName,
				objectAttributeDefinitions: [],
			}).save()
			
			const paths: string[] = []
			model.schema.eachPath(path => paths.push(path))

			for (let path of paths) {
				// ignore non system attribute
				if (path.includes('custom')) {
					continue
				}
				const schemaPath: any = model.schema.path(path)
				// add LocalizableAttributes to ObjectTypeDefinition
				if (schemaPath.instance && schemaPath.instance && schemaPath.instance && schemaPath.instance == 'ObjectID' && schemaPath.options && schemaPath.options && schemaPath.options.ref == 'LocalizableAttribute') {
					const OAD: IObjectAttributeDefinition = await new ObjectAttributeDefinition({
						type: schemaPath.options.defaultType,
						path: path,
						system: true,
						localizable: true,
						objectTypeDefinition: OTD._id
					}).save()

					await OTD.addObjectAttributeDefinition(OAD)
				}
			}
			await OTD.save()
		}

		console.log(chalk.magenta('[ObjectTypeDefinitionService.init] -- END'))
	}


	// ==== Custom Attribute Management ==== 
	// Creates a new attribute on all extensible objects of a model
	public async createObjectAttribute(OTD: IObjectTypeDefinition, OAD: IObjectAttributeDefinition) {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.createObjectAttribute]'))
		let docs: IExtensibleObject[] = <IExtensibleObject[]>(await model(OTD.objectName).find().exec())
		await Promise.all(docs.map(async(doc: IExtensibleObject): Promise<void> => {
			doc.custom.set(OAD.path, (await (new LocalizableAttribute().save()))._id)
			await doc.save()
		}))
	}

	// Resets an attribute on all extensible objects of a model
	public async updateObjectAttributeType(OAD: IObjectAttributeDefinition) {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.updateObjectAttributeType]'))
		await OAD.populate('objectTypeDefinition').execPopulate()
		console.log('OAD: ', OAD)
		console.log('OTD: ', OAD.objectTypeDefinition)
		const docs: IExtensibleObject[] = <IExtensibleObject[]>(await model(OAD.objectTypeDefinition.objectName).find().exec())
		await Promise.all(docs.map(async(doc: IExtensibleObject): Promise<void> => {
			await doc.populate('custom').execPopulate()
			await doc.custom.get(OAD.path).remove()
			doc.custom.set(OAD.path, (await (new LocalizableAttribute().save()))._id)
			doc.markModified('custom')
			await doc.save()
		}))
	}

	// Deletes an attribute on all extensible objects of a model
	public async deleteObjectAttribute(OTD: IObjectTypeDefinition, OAD: IObjectAttributeDefinition) {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.deleteObjectAttribute]'))
		let docs: IExtensibleObject[] = <IExtensibleObject[]>(await model(OTD.objectName).find().exec())
		await Promise.all(docs.map(async(doc: IExtensibleObject): Promise<void> => {
			await doc.populate('custom').execPopulate()
			await doc.custom.get(OAD.path).remove()
			doc.custom.delete(OAD.path)
			doc.markModified('custom')
			await doc.save()
		}))
	}

	// Initializes system and custom localizable attributes for object
	public async initExtensibleObject(object: IExtensibleObject) {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.initExtensibleObject]'))
		const OTD: IObjectTypeDefinition = await object.getObjectTypeDefinition()
		if (!OTD) {
			throw new InternalError(`Object Type Definition not found for ${((<any>object.constructor).modelName)}`)
		}
		if (OTD.objectAttributeDefinitions.length == 0) {
			return
		}

		await Promise.all(OTD.objectAttributeDefinitions
			.map(async(OAD: IObjectAttributeDefinition): Promise<void> => {
				if (!OAD.system) {
					object.custom.set(OAD.path, (await (new LocalizableAttribute().save()))._id)
				}
			})
		)
		object.markModified('custom')
	}

	private async addNewObjectAttributeDefinition(OTD: IObjectTypeDefinition, path: string, type: IObjectAttributeDefinition['type'], localizable: boolean): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.addObjectAttributeDefinition]`), path)
		if (OTD.objectAttributeDefinitions.find(x => x.path == path)) {
			throw new ValidationError(`Path ${path} already exists for object ${OTD.objectName}`)
		}
		const OAD: IObjectAttributeDefinition = await new ObjectAttributeDefinition({
			path,
			type,
			localizable, 
			objectTypeDefinition: OTD._id
		}).save()
		await OTD.addObjectAttributeDefinition(OAD)
		await OTD.save()
		await this.createObjectAttribute(OTD, OAD)
	}

	private async removeObjectAttributeDefinition(OTD: IObjectTypeDefinition, path: string): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.removeObjectAttributeDefinition]`))
		let OAD: IObjectAttributeDefinition = OTD.objectAttributeDefinitions.find(x => x.path == path)
		if (!OAD) {		
			throw new ValidationError(`Path ${path} does not exist for object ${OTD.objectName}`)
		}
		await this.deleteObjectAttribute(OTD, OAD)
		await OTD.removeObjectAttributeDefinition(OAD)
		OTD.markModified('objectAttributeDefinitions')
		await OTD.save()
		await OAD.remove()
	}
}

export const objectTypeDefinitionService: ObjectTypeDefinitionService = new ObjectTypeDefinitionService()