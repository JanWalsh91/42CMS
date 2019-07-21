import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog, Catalog } from './catalogModel'
import { ServerError, ErrorType } from '../utils/ServerError';
import chalk from 'chalk';
import { NavLinkProps } from 'react-router-dom';

// Define instance methods
class CategoryClass {
	// define virtuals here
	static async linkCategories(parent: ICategory, child: ICategory): Promise<any> {
		// console.log(chalk.magenta(`linkCategories. parent: ${parent.id} child: ${child.id}`))
		if (child.parent != null) {
			child = await child.populate('parent').execPopulate()
			this.unlinkCategories(child.parent, child)
		}
		await parent.updateOne({ $addToSet: { subCategories: child._id }}).exec()
		await child.updateOne({ $set: { parent: parent._id } }).exec()
		// console.log(chalk.magenta(`linkCategories. parent: ${parent.id} child: ${child.id} END`))
	}

	static async unlinkCategories(parent: ICategory, child: ICategory) {
		// console.log(chalk.magenta(`unlinkCategories. parent: ${parent.id} child: ${child.id}`))
		await parent.updateOne({ $pull: { subCategories: child._id }}).exec()
		await child.updateOne({ $unset: { parent: '' } }).exec()
		// console.log(chalk.magenta(`unlinkCategories. parent: ${parent.id} child: ${child.id} END`))
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
}

export interface ICategory extends Document {
	id: string,
	name: string,
	catalog: ICatalog['_id'],

	parent: ICategory['_id'],
	subCategories: [ICategory['_id']],

	getSubcategory: (query: object) => ICategory,
	// linkCategories: (parent: ICategory, child: ICategory) => Promise<any>,
	// unlinkCategories: (parent: ICategory, child: ICategory) => Promise<any>,

	wasNew: boolean, // internal
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
	}],
}).loadClass(CategoryClass)	

export interface ICategoryModel extends Model<ICategory> {
	linkCategories: (parent: ICategory, child: ICategory) => Promise<any>,
	unlinkCategories: (parent: ICategory, child: ICategory) => Promise<any>,
}

/**
 * 'On create' middleware
 * Create only if id not used in Catalog
 * Add to catalog.categories
 *  
 */  

CategorySchema.pre('save', function(this: ICategory, next: any) {
	// New Category
	if (this.isNew) {
		this.wasNew = false
		this.wasNew = false
		console.log(chalk.magenta('CategorySchema pre save ' + this.id))
		console.log(chalk.yellow('is new!'))
		this.wasNew = this.isNew

		// Check if category exists in catalog
		Catalog.findById(this.catalog).populate('categories').exec((err, catalog: ICatalog) => {
			if (err) { next(err); return; }

			if (catalog.categories.some((category: ICategory) => category.id == this.id)) {
				next(new ServerError(ErrorType.CATEGORY_EXISTS, this.id))
				return
			}
			catalog.categories.push(this._id)
			catalog.markModified('categories')
			catalog.save((err, _catalog: ICatalog) => {
				if (err) { next(err); return; }
				next()
			})
		})
	} else {
		next()
	}
	// next(err) // if fail
});


// CategorySchema.post('save', function(this: ICategory, doc, next: any) {
// 	if (this.wasNew) {
// 		console.log(chalk.magenta('CategorySchema post save'))
// 		console.log(chalk.yellow('was new!'))
// 		Catalog.findById(this.catalog, (err, res) => {
// 			next()
// 		})
// 	} else {
// 		next()
// 	}
// })

export const Category: ICategoryModel = model<ICategory, ICategoryModel>('Category', CategorySchema);
