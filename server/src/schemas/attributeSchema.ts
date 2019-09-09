import { Schema } from 'mongoose'
import { localeCode } from '../types'
import { globalSettingsService } from '../services'
import { ValidationError } from '../utils';
import { IGlobalSettings } from '../interfaces';
import { IAttribute } from '../interfaces';

// const attributeSchema = new Schema({
// 	_value: {
// 		type: Map,
// 		of: { type: String },
// 		default: { default: '' },
// 		required: true,
// 	}
// }, {_id: false, minimize: false})

const attributeSchema = new Schema({
	_value: {
		type: {},
		default: function () {
			if (this.localized === false) {
				return null
			} else {
				const m: Map<string, {}> = new Map<string, {}>()
				m.set('default', '')
				return m
			}
		},
		required: true
	},
}, {_id: false, minimize: false})

attributeSchema.methods = {
	getValue: async function(this: IAttribute, code?: localeCode): Promise<string>  {
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		return this._value[code]
		// return this.values[code]
	},
	setValue: async function(this: IAttribute, value: string, code?: localeCode): Promise<void> {
		console.log('setting value [' + value + '] at locale', code)
		console.log('_value', this._value)
		if (!code) {
			code = 'default'
		}
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
		// this.values[code] = value
		this._value[code] = value
		// console.log('set     value ', this.values)
		// this.markModified('values')
	},
}

export {
	attributeSchema,
}
