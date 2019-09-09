import chalk from 'chalk'

import { IObjectTypeDefinition } from '../interfaces'
import { patchRequest } from '../utils'
import { ObjectTypeDefinition } from '../models'
import { jsonDefaultObjectTypeDefinition } from '../types';

const defaultObjectTypeDefinitions: Record<string, jsonDefaultObjectTypeDefinition> = require('../src/resources/defaultObjectTypeDefinitions')

class ObjectTypeDefinitionService {

	public async update(objectTypeDefinitions: IObjectTypeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectTypeDefinition> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.update]`))

		// await this.patch(patchRequest, resources)
		
		return 
		// return objectTypeDefinitions.save()
	}

	public async getById(objecttype: string): Promise<IObjectTypeDefinition> {
		return ObjectTypeDefinition.findOne({objectName: objecttype}).exec()
	}

	public async init(): Promise<void> {
		console.log(chalk.magenta('[ObjectTypeDefinitionService.init]'))

		await ObjectTypeDefinition.deleteMany({})
		const defaultConfig = this.getDefaultObjectTypeDefinitions()

		await Promise.all(Object.keys(defaultConfig).map(async (objectName: string) => {
			const objectTypeDefintion: IObjectTypeDefinition = new ObjectTypeDefinition({
				objectAttributeDefinitions: [],
				objectName
			})
			await objectTypeDefintion.save()
			const attributesConfig = defaultConfig[objectName]
			
			attributesConfig.map((config) => {
				
			})
			
		}))
	}

	public getDefaultObjectTypeDefinitions(): Record<string, jsonDefaultObjectTypeDefinition> {
		return defaultObjectTypeDefinitions
	}
}

export const objectTypeDefinitionService: ObjectTypeDefinitionService = new ObjectTypeDefinitionService()