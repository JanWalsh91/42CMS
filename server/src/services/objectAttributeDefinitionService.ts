import attributeTypes from '../resources/attributeTypes'
import { IObjectAttributeDefinition } from '../interfaces'
import { patchRequest, Patchable, patchAction, ValidationError } from '../utils'
import { attributeType } from '../types'
import { objectTypeDefinitionService } from '.'

class ObjectAttributeDefinitionService extends Patchable<IObjectAttributeDefinition> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		type: {
			$set: async(objectAttributeDefinition: IObjectAttributeDefinition, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setType(objectAttributeDefinition, action.value)
			},
		},
		localizable: {
			$set: async(objectAttributeDefinition: IObjectAttributeDefinition, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setLocalizable(objectAttributeDefinition, action.value)
			},
		}
	}

	public async update(objectAttributeDefinition: IObjectAttributeDefinition, patchRequest: patchRequest, resources: any): Promise<IObjectAttributeDefinition> {
		await this.patch(objectAttributeDefinition, patchRequest, resources)
		return objectAttributeDefinition.save()
	}

	private async setType(objectAttributeDefinition: IObjectAttributeDefinition, value: attributeType): Promise<void> {
		if (!attributeTypes.includes(value)) {
			throw new ValidationError(`Invalid attribute type: ${value}`)
		}
		if (value != objectAttributeDefinition.type) {
			objectAttributeDefinition.type = value
			await objectTypeDefinitionService.updateObjectAttributeType(objectAttributeDefinition)
		}
	}

	private async setLocalizable(objectAttributeDefinition: IObjectAttributeDefinition, value: boolean): Promise<void> {
		objectAttributeDefinition.localizable = value
	}
}

export const objectAttributeDefinitionService: ObjectAttributeDefinitionService = new ObjectAttributeDefinitionService()