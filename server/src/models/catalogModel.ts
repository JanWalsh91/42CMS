import { Schema, Document } from 'mongoose'

class CatalogClass {

}

export interface ICatalog extends Document {
	id: string,
	name: string,
}

export const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
}, { _id : false }).loadClass(CatalogClass)