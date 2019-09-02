import { Schema } from 'mongoose'

const localeSchema = new Schema({
	id: String,
	language: String,
	country: String,
	fallback: String,
})

export {
	localeSchema,
}