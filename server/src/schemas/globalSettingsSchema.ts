import { Schema } from 'mongoose'
import chalk from 'chalk'

import { localeSettingsSchema } from './'
import { IGlobalSettings } from '../interfaces';

const globalSettingsSchema = new Schema({
	locale: {
		type: localeSettingsSchema,
		default: {
			locale: {
				availableLocales: []
			}
		}
	},
})

globalSettingsSchema.methods = {
	reset: async function (this: IGlobalSettings): Promise<void> {
		await this.locale.reset()
	}
}

globalSettingsSchema.plugin(require('mongoose-autopopulate'))


export {
	globalSettingsSchema
}