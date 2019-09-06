import { Schema } from 'mongoose'

const localeSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	language: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		default: null,
	},
	fallback: {
		type: Schema.Types.ObjectId,
		ref: 'Locale',
		default: null,
	},
})

export {
	localeSchema,
}