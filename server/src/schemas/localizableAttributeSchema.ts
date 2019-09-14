import { Schema } from 'mongoose'
import { localeCode } from '../types'
import { globalSettingsService } from '../services'
import { ValidationError } from '../utils';
import { IGlobalSettings } from '../interfaces';
import { ILocalizableAttribute } from '../interfaces';

const localizableAttributeSchema = new Schema({
	value: {
		type: Map,
		of: Schema.Types.Mixed,
		required: true,
		default: {
			default: null
		}
	},
	objectAttributeDefinition: {
		type: Schema.Types.ObjectId,
		ref: 'ObjectAttributeDefinition',
		autopopulate: true,
	}
})

localizableAttributeSchema.methods = {
	getValue: async function(this: ILocalizableAttribute, code?: localeCode): Promise<string>  {
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		return this.value[code]
		// return this.values[code]
	},
	set: async function(this: ILocalizableAttribute, value: any, code?: localeCode): Promise<void> {
		console.log('setting value [' + value + '] at locale', code)
		console.log('value', this.value)
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		this.value[code] = value
	},
	add: async function(this: ILocalizableAttribute, value: any, code?: localeCode): Promise<void> {
		console.log('add to value [' + value + '] at locale', code)
		
	}
}

export {
	localizableAttributeSchema,
}
