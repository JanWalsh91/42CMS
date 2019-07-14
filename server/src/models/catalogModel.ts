import { Schema, Document, Model, model } from 'mongoose'

import { IProject } from './projectModel'

class CatalogClass {

}

export interface ICatalog extends Document {
	id: string,
	name: string,
	project: IProject['_id']
}

const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true
	}
}).loadClass(CatalogClass)	

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)