import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog } from './catalogModel'

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



	setParent(this: ICategory, parentID: string) {}

}

export interface ICategory extends Document {
	id: string,
	name: string,
	catalog: ICatalog['_id'],

	parent: ICategory['_id'],
	subCategories: [ICategory['_id']],

	getSubcategory: (query: object) => ICategory,
	setParent: (this: ICategory, parentID: string) => void,

}

export const CategorySchema = new Schema({
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
	},
	parent: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
	},
	subCategories: [{
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: null
	}],
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: null
	}]
}).loadClass(CategoryClass)	

export const Category: Model<ICategory> = model('Category', CategorySchema);
