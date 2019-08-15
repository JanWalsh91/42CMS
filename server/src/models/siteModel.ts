import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog } from './catalogModel'


class SiteClass {
	// define virtuals here
	getAssignedCatalog() {}
}

export interface ISite extends Document {
	id: string,
	name: string,
	assignedCatalogs: [ICatalog['_id']],

	getAssignedCatalog: (this: ISite, query: object) => ICatalog,
}

export const SiteSchema = new Schema({
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
}).loadClass(SiteClass)

export const Site: Model<ISite> = model('Site', SiteSchema)