import chalk from 'chalk'

import { IObjectTypeDefinition, IGlobalSettings, IObjectAttributeDefinition, ILocalizableAttribute, IExtensibleObject } from '../interfaces'
import { patchRequest, ValidationError, patchAction, InternalError } from '../utils'
import { globalSettingsService, objectTypeDefinitionService } from '.'
import { localeCode, attributeType } from '../types'
import attributeTypes from '../resources/attributeTypes'

class LocalizableAttributeService {
	
	public async update(attribute: ILocalizableAttribute, OAD: IObjectAttributeDefinition, key: string, patchAction: patchAction): Promise<void> {
		console.log(chalk.magenta(`[LocalizableAttributeService.update]`))
		console.log('attribute:', attribute)
		console.log('OAD:', OAD)
		console.log('patchAction:', patchAction)

		let locale = patchAction.locale ? patchAction.locale : 'default'

		await this.validateAction(OAD.type, patchAction.op)
		await this.validateLocale(locale)
		await this.validateValue(OAD.type, patchAction.value)

		await attribute[patchAction.op](patchAction.value, locale)

		await attribute.save()
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

	private async validateLocale(code: localeCode): Promise<void> {
		const globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
	}

	private async validateValue(type: attributeType, value: any): Promise<void> {
		const validate: Record<string, (x: any) => boolean> = {
			'string' : (x: any) => typeof x == 'string',
			'number' : (x: any) => typeof x == 'number',
			'boolean': (x: any) => typeof x == 'boolean',
			'html'   : (x: any) => typeof x == 'string',
			'date'   : (x: any) => !isNaN(<any>(new Date(x))),
		}

		let baseType: attributeType = type.includes('[]') ? type.split('[]')[0] as attributeType : type
		
		if (Array.isArray(value)) {
			if (this.typeIsArray(type)) {
				for (let val of value) {
					if (!validate[baseType](val)) {
						throw new ValidationError(`Invalid value [${val}] for type [${type}]`)
					}
				}		
			} else {
				throw new ValidationError(`Invalid value [${value}] for type [${type}]`)
			}
		} else {
			if (!validate[baseType](value)) {
				throw new ValidationError(`Invalid value [${value}] for type [${type}]`)
			}
		}
	}

	private async validateAction(type, action): Promise<void> {
		if (this.typeIsArray(type)) {
			if (!['$set','$add', '$remove'].includes(action)) {
				throw new ValidationError(`Invalid action [${action}] for type [${type}]`)
			}
		} else {
			if (!['$set'].includes(action)) {
				throw new ValidationError(`Invalid action [${action}] for type [${type}]`)
			}
		}
	}

	private typeIsArray(type: attributeType): boolean {
		return type.includes('[]')
	}
}

export const localizableAttributeService: LocalizableAttributeService = new LocalizableAttributeService()
