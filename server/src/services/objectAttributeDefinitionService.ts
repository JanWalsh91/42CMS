import { Model, model, SchemaType } from 'mongoose'
import chalk from 'chalk'

import attributeTypes from '../resources/attributeTypes'
import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError } from '../utils'
import { ObjectTypeDefinition, Product } from '../models'
import { attributeType } from '../types'

class ObjectAttributeDefinitionService extends Patchable {
	patchMap = {
		type: {
			$set: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['value'])
				await this.setType(action.resources.objectAttributeDefinition, action.value)
			},
		},
		localizable: {
			$set: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectTypeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['value'])
				await this.setLocalizable(action.resources.objectAttributeDefinition, action.value)
			},
		}
	}

	public async update(objectAttributeDefinition: IObjectAttributeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectAttributeDefinition> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.update]`))

		await this.patch(patchRequest, resources)
		return objectAttributeDefinition
	}

	private async setType(objectAttributeDefinition: IObjectAttributeDefinition, value: attributeType): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.setType]`))
		if (!attributeTypes.includes(value)) {
			throw new ValidationError(`Invalid attribute type: ${value}`)
		}
		objectAttributeDefinition.type = value
		// TODO: reset all attributes of this type
	}

	private async setLocalizable(objectAttributeDefinition: IObjectAttributeDefinition, value: boolean): Promise<void> {
		console.log(chalk.magenta(`[ObjectTypeDefinitionService.setLocalizable]`))
		objectAttributeDefinition.localizable = value
	}
}

export const objectAttributeDefinitionService: ObjectAttributeDefinitionService = new ObjectAttributeDefinitionService()