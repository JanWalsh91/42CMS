import { Model, model, SchemaType, Types } from 'mongoose'
import chalk from 'chalk'

import attributeTypes from '../resources/attributeTypes'
import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError } from '../utils'
import { ObjectTypeDefinition, Product } from '../models'
import { attributeType } from '../types'
import { objectTypeDefinitionService } from '.';

class ObjectAttributeDefinitionService extends Patchable<IObjectAttributeDefinition> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		type: {
			$set: async(objectAttributeDefinition: IObjectAttributeDefinition, action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectAttributeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['value'])
				await this.setType(objectAttributeDefinition, action.value)
			},
		},
		localizable: {
			$set: async(objectAttributeDefinition: IObjectAttributeDefinition, action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ObjectAttributeDefinitionService.objectAttributeDefinitions.$add]'))
				this.checkRequiredProperties(action, ['value'])
				await this.setLocalizable(objectAttributeDefinition, action.value)
			},
		}
	}

	public async update(objectAttributeDefinition: IObjectAttributeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectAttributeDefinition> {
		console.log(chalk.magenta(`[ObjectAttributeDefinitionService.update]`))

		await this.patch(objectAttributeDefinition, patchRequest, resources)
		return objectAttributeDefinition
	}

	private async setType(objectAttributeDefinition: IObjectAttributeDefinition, value: attributeType): Promise<void> {
		console.log(chalk.magenta(`[ObjectAttributeDefinitionService.setType]`))
		if (!attributeTypes.includes(value)) {
			throw new ValidationError(`Invalid attribute type: ${value}`)
		}
		if (value != objectAttributeDefinition.type) {
			objectAttributeDefinition.type = value
			await objectTypeDefinitionService.updateObjectAttributeType((<any>objectAttributeDefinition).ownerDocument(), objectAttributeDefinition)
		}
	}

	private async setLocalizable(objectAttributeDefinition: IObjectAttributeDefinition, value: boolean): Promise<void> {
		console.log(chalk.magenta(`[ObjectAttributeDefinitionService.setLocalizable]`))
		objectAttributeDefinition.localizable = value
	}

	
}

export const objectAttributeDefinitionService: ObjectAttributeDefinitionService = new ObjectAttributeDefinitionService()