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
	// objectAttributeDefinition: {
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'ObjectAttributeDefinition',
	// 	autopopulate: true,
	// }
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
	$set: async function(this: ILocalizableAttribute, value: any, code?: localeCode): Promise<void> {
		console.log('setting value [' + value + '] at locale', code)
		console.log('value BEFORE', this.value)
		if (!code) {
			code = 'default'
		}
		console.log('code:', code)
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		// this.value[code] = value
		this.value.set(code, value)
		console.log('value AFTER', this.value)
	},
	$add: async function(this: ILocalizableAttribute, value: any, code?: localeCode): Promise<void> {
		console.log('add to value [' + value + '] at locale', code)
	},
	$remove: async function(this: ILocalizableAttribute, value: any, code?: localeCode): Promise<void> {
		console.log('remove from value [' + value + '] at locale', code)
	},
}

localizableAttributeSchema.plugin(require('mongoose-autopopulate'))

export {
	localizableAttributeSchema,
}
