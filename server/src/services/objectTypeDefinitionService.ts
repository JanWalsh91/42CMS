import { IObjectTypeDefinition, IObjectAttributeDefinition, IExtensibleObject, ILocalizableAttribute } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError, InternalError } from '../utils'
import { ObjectTypeDefinition, Product, LocalizableAttribute, ObjectAttributeDefinition, Image, Site } from '../models'
import { Model, model } from 'mongoose'
import { objectAttributeDefinitionService } from '.'

const hasOnlyLetters = new RegExp('^[a-zA-Z0-9]+$')

class ObjectTypeDefinitionService extends Patchable<IObjectTypeDefinition> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	
	patchMap = {
		objectAttributeDefinitions: {
			$add: async(objectTypeDefinition: IObjectTypeDefinition, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['path', 'type'])
				await this.addNewObjectAttributeDefinition(objectTypeDefinition,
					action.path,
					action.type,
					action.localizable || true,
				)
			},
			$remove: async(objectTypeDefinition: IObjectTypeDefinition, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['path'])
				await this.removeObjectAttributeDefinition(objectTypeDefinition, action.path)
			},
		}
	}

	static defaultModels: Model<any>[] = [ Product, Image, Site ]

	public async update(objectTypeDefinition: IObjectTypeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectTypeDefinition> {
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
		if (!models || !models.length) {
			models = ObjectTypeDefinitionService.defaultModels
		}
		await Promise.all(models.map(async (model: Model<any>) => ObjectTypeDefinition.find({objectName: model.modelName}).remove()))

	}

	public async init(models?: Model<any>[]): Promise<void> {
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
	}


	// ==== Custom Attribute Management ==== 
	// Creates a new attribute on all extensible objects of a model
	public async createObjectAttribute(OTD: IObjectTypeDefinition, OAD: IObjectAttributeDefinition) {
		let docs: IExtensibleObject[] = <IExtensibleObject[]>(await model(OTD.objectName).find().exec())
		await Promise.all(docs.map(async(doc: IExtensibleObject): Promise<void> => {
			doc.custom.set(OAD.path, (await (new LocalizableAttribute().save()))._id)
			await doc.save()
		}))
	}

	// Resets an attribute on all extensible objects of a model
	public async updateObjectAttributeType(OAD: IObjectAttributeDefinition) {
		await OAD.populate('objectTypeDefinition').execPopulate()
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
		if (typeof path != 'string' || !hasOnlyLetters.test(path)) {
			throw new ValidationError(`Invalid path name [${path}]`)
		}
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
		let OAD: IObjectAttributeDefinition = OTD.objectAttributeDefinitions.find(x => x.path == path)
		if (!OAD) {		
			throw new ValidationError(`Path ${path} does not exist for object ${OTD.objectName}`)
		}
		if (OAD.system) {
			throw new ValidationError(`Cannot remove a system attribute`)
		}
		await this.deleteObjectAttribute(OTD, OAD)
		await OTD.removeObjectAttributeDefinition(OAD)
		OTD.markModified('objectAttributeDefinitions')
		await OTD.save()
		await OAD.remove()
	}

	public async extensibleObjectToXMLJSON(eObj: IExtensibleObject) {
		let OTD: IObjectTypeDefinition = await eObj.getObjectTypeDefinition()

		let systemattribute: any = []
		let customattribute: any = []
		OTD.objectAttributeDefinitions.forEach((OAD: IObjectAttributeDefinition) => {
			let value: any = []
	
			let attr: ILocalizableAttribute = OAD.system ? eObj[OAD.path] : eObj.custom[OAD.path]
	
			attr.value.forEach((val, key) => {
				value.push({
					'@locale': key,
					value: val
				})
			})

			if (OAD.system) {
				systemattribute.push({
					'@path': OAD.path,
					value
				})
			} else {
				customattribute.push({
					'@path': OAD.path,
					value
				})
			}
		})
		let ret: any = {
			systemattributes: { systemattribute } ,
			customattributes: { customattribute },
		}
		return ret
	}
}

export const objectTypeDefinitionService: ObjectTypeDefinitionService = new ObjectTypeDefinitionService()