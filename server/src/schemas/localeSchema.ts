import { Schema } from 'mongoose'

import { IUser, ILocale } from '../interfaces'

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

localeSchema.methods = {
	// ==== to ====
	toJsonForUser: async function(this: ILocale, user: IUser): Promise<any> {
		await this.populate('fallback').execPopulate()
		let res = (({id, language, country, fallback}) => (({id, language, country, fallback: fallback ? fallback.id : null })))(this)
		return res
	},

	// ==== set ====
	setFallback: function(this: ILocale, fallbackLocale: ILocale): void {
		this.fallback = fallbackLocale
	}

}

localeSchema.plugin(require('mongoose-autopopulate'))

export {
	localeSchema,
}