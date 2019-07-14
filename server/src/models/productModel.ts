import { Schema, Document, Model, model } from 'mongoose'

import { IProject } from './projectModel'

class ProductClass {

}

export interface IProduct extends Document {
	id: string,
	name: string,
	project: IProject['_id']
}

const ProductSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true
	}
}).loadClass(ProductClass)	

export const Product: Model<IProduct> = model('Product', ProductSchema)