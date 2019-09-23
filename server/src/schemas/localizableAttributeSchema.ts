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
			default: null,
		},
	},
})

localizableAttributeSchema.methods = {
	getValue: async function(this: ILocalizableAttribute, code: localeCode = 'default'): Promise<any>  {
		return this.value.get(code)
	},
	$set: async function(this: ILocalizableAttribute, value: any, code: localeCode = 'default'): Promise<void> {
		this.value.set(code, value)
		this.markModified('value')
	},
	$add: async function(this: ILocalizableAttribute, value: any, code: localeCode = 'default'): Promise<void> {
		console.log('add to value [' + value + '] at locale', code)
		if (!Array.isArray(this.value.get(code))) {
			this.value.set(code, [value])
		} else {
			this.value.get(code).push(value)
		}
		this.markModified('value')
	},
	$remove: async function(this: ILocalizableAttribute, value: any, code: localeCode = 'default'): Promise<void> {
		console.log('remove from value [' + value + '] at locale', code)
		if (!Array.isArray(this.value.get(code))) {
			this.value.set(code, [])
		} else {
			this.value.set(code, this.value.get(code).filter(x => x != value))
		}
		this.markModified('value')
	},
}

localizableAttributeSchema.plugin(require('mongoose-autopopulate'))

export {
	localizableAttributeSchema,
}