import chalk from 'chalk'

import { IObjectTypeDefinition, IGlobalSettings, IObjectAttributeDefinition, ILocalizableAttribute, IExtensibleObject } from '../interfaces'
import { patchRequest, ValidationError, patchAction, InternalError } from '../utils'
import { globalSettingsService, objectTypeDefinitionService } from '.'
import { localeCode } from '../types'
import { Document } from 'mongoose'

class LocalizableAttributeService {
	
	public async update(attribute: ILocalizableAttribute, OAD: IObjectAttributeDefinition, key: string, patchAction: patchAction): Promise<void> {
		console.log(chalk.magenta(`[LocalizableAttributeService.update]`))
		console.log('attribute:', attribute)
		console.log('OAD:', OAD)
		console.log('patchAction:', patchAction)

		if (!isValidTypeAndAction(OAD.type, patchAction.op)) {
			throw new ValidationError(`Invalid action [${patchAction.op}] for type [${OAD.type}]`)
		}

		let locale = patchAction.locale ? patchAction.locale : undefined

		switch (OAD.type) {
			case 'string':
				await attribute[patchAction.op](String(patchAction.value), locale)
				break 
			case 'number':
				await attribute[patchAction.op](Number(patchAction.value), locale)
				break 
		}
		attribute.markModified('value')
		await attribute.save()
	}

	// TODO: unused
	private async validateValid(code: localeCode): Promise<void> {
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
	}

	public async deleteAttributesFromExtensibleObject(obj: IExtensibleObject) : Promise<void> {
		// console.log(chalk.magenta(`[LocalizableAttributeService.deleteAttributesFromExtensibleObject]`))
		const OTD: IObjectTypeDefinition = await objectTypeDefinitionService.getByDocument(obj)
		if (!OTD) {
			throw new InternalError('Invalid Object')
		}
		await Promise.all(OTD.objectAttributeDefinitions.map((OAT: IObjectAttributeDefinition) => {
			if (!obj[OAT.path] && !obj.custom.get(OAT.path)) {
				return 
			}
			if (OAT.system) {
				return obj[OAT.path].remove()
			} else {
				return obj.custom.get(OAT.path).remove()
			}
		}))
	}
}

export const localizableAttributeService: LocalizableAttributeService = new LocalizableAttributeService()

const actionsByType = {
	'string': ['$set'],
	'number': ['$set'],
	'string[]': ['$add', '$remove'],
	'number[]': ['$add', '$remove'],
}

const isValidTypeAndAction = (type, action) => actionsByType.hasOwnProperty(type) && actionsByType[type].includes(action)