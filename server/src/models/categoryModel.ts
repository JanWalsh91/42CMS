import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog, Catalog } from '../models'

import chalk from 'chalk';
// import { ModelUpdateOptions } from '../utils/ModelUpdateOptions';
import { ResourceNotFoundError, ValidationError } from '../utils/Errors';

// Define instance methods
class CategoryClass {
	// define virtuals here

	async getParent(this: ICategory): Promise<ICategory> {
		await this.populate('parent').execPopulate()
		return this.parent
	}

	async getCatalog(this: ICategory): Promise<ICatalog> {
		await this.populate('catalog').execPopulate()
		return this.catalog
	}

	async getSubCategory(this: ICategory, query: object): Promise<ICategory> {
		return await Category.findOne({ catalog: this.populated('catalog') ? this.catalog._id : this.catalog, parent: this._id, ...query })
	}

	// async getProduct(this: ICategory, query: object): Promise<IProduct> {
	// 	return await Product.findOne({ catalog: this.populated('catalog') ? this.catalog._id : this.catalog, category: this._id, ...query })
	// }

	/**
	 * Check if:
	 * - category in catalog
	 * - doesn't yet exists in category
	 * - TODO: does not loop
	 */
	async addSubCategory(this: ICategory, category: ICategory) {
		console.log(chalk.magenta(`[CategoryModel.addSubCategory] ${category.id} to ${this.id}`))
		if (!category) {
			throw new ResourceNotFoundError('Category', '')
		}
		if (category._id in this.subCategories) {
			console.log(chalk.yellow('[CategoryModel.addSubCategory] category already in subCategories'))
			return 
		}
		this.subCategories.push(category._id)
		this.markModified('subCategories')
	}

	/**
	 * Check if:
	 * - product is in category's catalog
	 * - doesn't already exist in category
	 */
	// async addProduct(this: ICategory, productId: IProduct['_id'], options: ModelUpdateOptions = {}): Promise<ServerError | void> {
	// 	console.log(chalk.magenta(`[CategoryModel.addProduct] ${productId} to ${this._id}`))
	// 	if (!options.skipCheckExists) {
	// 		await this.getCatalog()
	// 		const product: IProduct = await this.catalog.getProduct({ _id: productId })
	// 		if (!product) {
	// 			throw new ResourceNotFoundError('Product', productId)
	// 		}
	// 	}
	// 	if (productId in this.products) {
	// 		console.log(chalk.yellow('[CategoryModel.addProduct] product already in category'))
	// 		return 
	// 	}
	// 	this.products.push(productId)
	// 	this.markModified('products')
	// }


	async setParent(this: ICategory, category: ICategory | null): Promise<void> {
		console.log(chalk.magenta(`[CategoryModel.setParent] ${category ? category.id : null} from ${this.id}`))
		if (category === null) {
			this.parent = null
			this.markModified('parent')
		} else {
			if (!category) {
				throw new ResourceNotFoundError('Category', '')
			}
			if (category._id === (this.populated('parent') ? this.parent._id : this.parent)) {
				console.log(chalk.yellow('[CategoryModel.setParent] category already is parent'))
				return 
			}
			this.parent = category._id
			this.markModified('parent')
		}
	}


	async removeSubCategory(this: ICategory, category: ICategory) {
		console.log(chalk.magenta(`[CategoryModel.removeSubCategory] ${category.id} from ${this.id}`))
		await this.populate('subCategories').execPopulate()
		if (this.subCategories.some(x => x._id.equals(category._id))) {
			this.subCategories = this.subCategories.filter(x => !x._id.equals(category._id))
			this.markModified('subCategories')
		} else {
			console.log(chalk.yellow(`[CategoryModel.removeSubCategory] ${category.id} not in ${this.id}`))
		}
	}

	// async removeProduct(this: ICategory, productId: IProduct['_id']) {
	// 	console.log(chalk.magenta(`[CategoryModel.removeProduct] ${productId} from ${this._id}`))
	// 	if (productId in this.products) {
	// 		this.products = this.products.filter(x => x !== productId)
	// 		this.markModified('products')
	// 	} else {
	// 		console.log(chalk.yellow(`[CategoryModel.removeProduct] ${productId} not in ${this._id}`))
	// 	}
	// }

	// Move to service


}

export interface ICategory extends Document {
	id: string
	name: string
	catalog: ICatalog['_id'] | ICatalog
	parent: ICategory['_id'] | ICategory
	subCategories: (ICategory['_id'] | ICategory)[]
	// products: IProduct['_id'][]

	// get methods
	getParent: () => Promise<ICategory>
	getCatalog: () => Promise<ICatalog>
	getSubCategory: (query: object) => Promise<ICategory>
	// getProduct: (query: object) => Promise<IProduct>

	// add methods
	addSubCategory: (category: ICategory) => Promise<void>
	// addProduct: (productId: IProduct['_id']) => Promise<ServerError | void>

	// set methods
	setParent: (category: ICategory | null) => Promise<void>

	// remove methods
	removeSubCategory: (category: ICategory) => Promise<void>
	// removeProduct: (productId: IProduct['_id']) => Promise<void>

	// internal
	wasNew: boolean
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
		default: null,
	},
	subCategories: [{
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: null
	}],
	// products: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Product',
	// 	default: null
	// }],
}).loadClass(CategoryClass)	

/**
 * 'On create' middleware
 * Create only if id not used in Catalog
 * Add to catalog.categories
 *  
 */  

// CategorySchema.pre('save', function(this: ICategory, next: Function) {
// 	// New Category
// 	if (this.isNew) {
// 		this.wasNew = false
// 		console.log(chalk.magenta('CategorySchema pre save ' + this.id))
// 		console.log(chalk.yellow('is new!'))
// 		this.wasNew = this.isNew

// 		// Check if category in catalog
// 		// Update catalog.categories
// 		Catalog.findById(this.catalog).populate('categories').exec((err, catalog: ICatalog) => {
// 			if (err) { next(err); return; }

// 			if (catalog.categories.some((category: ICategory) => category.id == this.id)) {
// 				throw new ValidationError('Category already exists')
// 			}
// 			catalog.categories.push(this._id)
// 			catalog.markModified('categories')
// 			catalog.save((err, _catalog: ICatalog) => {
// 				if (err) { next(err); return; }
// 				next()
// 			})
// 		})
// 	} else {
// 		next()
// 	}
// 	// next(err) // if fail
// });


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

export const Category: Model<ICategory> = model<ICategory>('Category', CategorySchema);
