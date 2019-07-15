import { Schema, Document } from 'mongoose'

class ProductClass {

}

export interface IProduct extends Document {
	id: string,
	name: string,
}

export const ProductSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true
	},
}, { _id : false }).loadClass(ProductClass)	