import { Schema } from 'mongoose'
import chalk from 'chalk'

import { localeSchema } from '.';

const allLocales = require('../resources/locales.json')

// import ISetting from '../interfaces'

const localeSettingsSchema = new Schema({
	allowedLocales: [localeSchema]
})

localeSettingsSchema.methods = {
	getAllLocales: () => allLocales
}

export {
	localeSettingsSchema,
}