import { Schema } from 'mongoose'
import chalk from 'chalk'

import { localeSchema } from '.';
import { ILocale } from '../interfaces';

const allLocales = require('../resources/locales.json')

const localeSettingsSchema = new Schema({
	allowedLocales: {
		type: [localeSchema],
		default: () => {
			for (let i = 0; i < allLocales; i++) {
				let locale: ILocale = allLocales[i]
				if (locale.fallback) {
					
				}
			}
		}
	}
})

localeSettingsSchema.methods = {
	getAllLocales: () => allLocales
}

export {
	localeSettingsSchema,
}