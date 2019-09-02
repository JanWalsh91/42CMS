import { Schema, Model, model } from 'mongoose'

import { ISite } from '../interfaces'

const SiteSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true,
	},
	assignedCatalogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		default: null
	}]
})

SiteSchema.methods = {
	
}

export const Site: Model<ISite> = model('Site', SiteSchema)