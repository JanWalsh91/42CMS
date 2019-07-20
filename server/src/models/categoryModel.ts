import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog } from './catalogModel'
import { ServerError, ErrorType } from '../utils/ServerError';
import chalk from 'chalk';

class CategoryClass {
	// define virtuals here
	static async create(catalog: ICatalog, id: string, name: string, parentCategoryId?: string): Promise<ICategory | void> {
		let newCategory: ICategory = new Category({ id, name, catalog: catalog._id})
		
		catalog = await catalog.populate('categories').execPopulate()

		// Check if category exists in catalog
		if (catalog.categories.some((category: ICategory) => category.id == newCategory.id)) {
			throw new ServerError(ErrorType.CATEGORY_EXISTS, newCategory.id)
		}

		// Save category
		newCategory = await newCategory.save()
		
		if (parentCategoryId) {
			// Link parent with child category
			let parentCategory: ICategory = catalog.categories.find((category: ICategory) => category.id == parentCategoryId)
			if (parentCategory) {
				newCategory.setParent(parentCategory)
			} else {
				console.log(chalk.red('No parent category found for ' + parentCategoryId))
			}
		}

		// Add category to catalog
		await  catalog.updateOne({ $push: { categories: newCategory._id }})
		return newCategory
	}
	getSubCategory(this: ICategory, query: object): ICategory {
		for (let i = 0; i < this.subCategories.length; i++) {
			let category = this.subCategories[i]
			if (Object.keys(query).every(key => category[key] == query[key])) {
				return category
			}
		}
		return null;
	}

	/**
	 * Set this category as child of parent
	 * @param this 
	 * @param parent 
	 */
	setParent(this: ICategory, parent: ICategory) {

	}

}

export interface ICategory extends Document {
	id: string,
	name: string,
	catalog: ICatalog['_id'],

	parent: ICategory['_id'],
	subCategories: [ICategory['_id']],

	getSubcategory: (query: object) => ICategory,
	setParent: (this: ICategory, parent: ICategory) => void,

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
