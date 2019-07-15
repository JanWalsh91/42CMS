import { Schema, Document } from 'mongoose'

import { CategorySchema, ICategory } from './categoryModel'

class CatalogClass {
	// define virtuals here
	getCategory(this: ICatalog, query: object): ICategory {
		for (let i = 0; i < this.categories.length; i++) {
			let category = this.categories[i]
			if (Object.keys(query).every(key => category[key] == query[key])) {
				return category
			}
		}
		return null;
	}
}

export interface ICatalog extends Document {
	id: string,
	name: string,
	categories: [ICategory],
	getCategory: (query: object) => ICategory,
}

export const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	categories: [CategorySchema],
}, { _id : false }).loadClass(CatalogClass)