import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog } from './catalogModel'

class CategoryClass {

}

export interface ICategory extends Document {
	id: string,
	name: string,
	catalog: ICatalog['_id'],
}

const CategorySchema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
	},
	catalog: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		required: true
	}
}).loadClass(CategoryClass)	

export const Category: Model<ICategory> = model('Category', CategorySchema)