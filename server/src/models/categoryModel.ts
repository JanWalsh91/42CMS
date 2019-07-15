import { Schema, Document, Model, model } from 'mongoose'

import { CatalogSchema } from './catalogModel'

class CategoryClass {
	// define virtuals here
	getSubCategory(this: ICategory, query: object): ICategory {
		for (let i = 0; i < this.subCategories.length; i++) {
			let category = this.subCategories[i]
			if (Object.keys(query).every(key => category[key] == query[key])) {
				return category
			}
		}
		return null;
	}
}

export interface ICategory extends Document {
	id: string,
	name: string,
	parentCategory: ICategory['_id'],
	subCategories: [ICategory['_id']],
	getSubcategory: (query: object) => ICategory,
}

export const CategorySchema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
	},
	parentCategory: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog.categories',
		default: null
	},
	subCategories: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog.categories',
		default: null
	}],
}, { _id : true }).loadClass(CategoryClass)	
