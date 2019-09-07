import { Schema } from 'mongoose'
import { localeCode } from '../types'
import { globalSettingsService } from '../services'
import { ValidationError } from '../utils';
import { IGlobalSettings } from '../interfaces';
import { ILocalizableAttribute } from '../interfaces/ILocalizableAttribute';


const localizableAttributeSchema = new Schema({
	values: {
		type: Map,
		of: { type: String },
		default: { default: '' },
		required: true,
	}
}, {_id: false, minimize: false})

localizableAttributeSchema.methods = {
	getValue: async function(this: ILocalizableAttribute, code?: localeCode): Promise<string>  {
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		return this.values.get(code)
		// return this.values[code]
	},
	setValue: async function(this: ILocalizableAttribute, value: string, code?: localeCode): Promise<void> {
		console.log('setting value ', this.values, ' at locale', code)
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		// this.values[code] = value
		this.values.set(code, value)
		console.log('set     value ', this.values)
		this.markModified('values')
	},
}

export {
	localizableAttributeSchema,
}
