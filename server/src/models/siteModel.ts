import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog } from './catalogModel'

export interface ISite extends Document {
	id: string,
	name: string,
	assignedCatalogs: [ICatalog['_id']],

	getAssignedCatalog: (this: ISite, query: object) => ICatalog,
}

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