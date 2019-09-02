import { Schema } from 'mongoose'
import chalk from 'chalk'

import { localeSettingsSchema } from './'

const globalSettingsSchema = new Schema({
	locale: localeSettingsSchema
})

export {
	globalSettingsSchema
}