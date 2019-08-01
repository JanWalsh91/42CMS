import { Schema, Document, Model, model } from 'mongoose'

import { ICatalog, Catalog } from './catalogModel'
import { ServerError, ErrorType } from '../utils/ServerError';
import chalk from 'chalk';
import { NavLinkProps } from 'react-router-dom';
import { IProduct, Product } from './productModel';
import { AddOptions } from '../types/addOptions';

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
		return await Category.findOne({ catalog: this.populated('catalog') || this.catalog, parent: this._id, ...query })
	}

	async getProduct(this: ICategory, query: object): Promise<IProduct> {
		return await Product.findOne({ catalog: this.populated('catalog') || this.catalog, category: this._id, ...query })
	}

	/**
	 * Check if:
	 * - category in catalog
	 * - doesn't yet exists in category
	 * - TODO: does not loop
	 */
	async addSubCategory(this: ICategory, categoryId: ICategory['_id'], options: AddOptions = {}) {
		console.log(chalk.magenta(`[CategoryModel.addSubCategory] ${categoryId} to ${this._id}`))
		if (!options.skipCheckExists) {
			await this.getCatalog()
			const category: ICategory = await this.catalog.getCategory({ _id: categoryId })
			if (!category) {
				throw new ServerError(ErrorType.CATEGORY_NOT_FOUND)
			}
		}
		if (categoryId in this.subCategories) {
			console.log(chalk.yellow('[CategoryModel.addSubCategory] category already in subCategories'))
			return 
		}
		this.subCategories.push(categoryId)
		this.markModified('subCategories')
	}

	/**
	 * Check if:
	 * - product is in category's catalog
	 * - doesn't already exist in category
	 */
	async addProduct(this: ICategory, productId: IProduct['_id'], options: AddOptions = {}): Promise<ServerError | void> {
		console.log(chalk.magenta(`[CategoryModel.addProduct] ${productId} to ${this._id}`))
		if (!options.skipCheckExists) {
			await this.getCatalog()
			const product: IProduct = await this.catalog.getProduct({ _id: productId })
			if (!product) {
				throw new ServerError(ErrorType.PRODUCT_NOT_FOUND)
			}
		}
		if (productId in this.products) {
			console.log(chalk.yellow('[CategoryModel.addProduct] product already in category'))
			return 
		}
		this.products.push(productId)
		this.markModified('products')
	}


	async setParent(this: ICategory, categoryId: ICategory['_id'] | null, options: AddOptions = {}): Promise<ServerError | void> {
		console.log(chalk.magenta(`[CategoryModel.setParent] ${categoryId} from ${this._id}`))
		if (!categoryId) {
			this.parent = null
			this.markModified('parent')
		} else {
			if (!options.skipCheckExists) {
				await this.getCatalog()
				const category: ICategory = await this.catalog.getCategory({ _id: categoryId })
				if (!category) {
					throw new ServerError(ErrorType.CATEGORY_NOT_FOUND)
				}
			}
			if (categoryId === this.parent) {
				console.log(chalk.yellow('[CategoryModel.setParent] category already is parent'))
				return 
			}
			this.parent = categoryId
			this.markModified('parent')
		}
	}


	async removeSubCategory(this: ICategory, categoryId: ICategory['_id']) {
		console.log(chalk.magenta(`[CategoryModel.removeSubCategory] ${categoryId} from ${this._id}`))
		if (categoryId in this.subCategories) {
			this.subCategories = this.subCategories.filter(x => x !== categoryId)
			this.markModified('subCategories')
		} else {
			console.log(chalk.yellow(`[CategoryModel.removeSubCategory] ${categoryId} not in ${this._id}`))
		}
	}

	async removeProduct(this: ICategory, productId: IProduct['_id']) {
		console.log(chalk.magenta(`[CategoryModel.removeProduct] ${productId} from ${this._id}`))
		if (productId in this.products) {
			this.products = this.products.filter(x => x !== productId)
			this.markModified('products')
		} else {
			console.log(chalk.yellow(`[CategoryModel.removeProduct] ${productId} not in ${this._id}`))
		}
	}

	// TODO: Should pass ID and options
	static async linkCategories(parent: ICategory, child: ICategory): Promise<any> {
		console.log(chalk.magenta(`linkCategories. parent: ${parent.id} child: ${child.id}`))
		if (child.parent != null) {
			await child.getParent()
			await this.unlinkCategories(child.parent._id, child._id)
		}
		return Promise.all([
			parent.addSubCateory(child._id),
			child.setParent(parent._id),
		])
		// console.log(chalk.magenta(`linkCategories. parent: ${parent.id} child: ${child.id} END`))
	}

	// TODO: Should pass ID and options
	static async unlinkCategories(parent: ICategory['_id'], child: ICategory) {
		console.log(chalk.magenta(`unlinkCategories. parent: ${parent.id} child: ${child.id}`))
		return Promise.all([
			parent.removeSubCateory(child._id),
			child.setParent(null),
		])
		// console.log(chalk.magenta(`unlinkCategories. parent: ${parent.id} child: ${child.id} END`))
	}

}

export interface ICategory extends Document {
	id: string
	name: string
	catalog: ICatalog['_id'] | ICatalog
	parent: ICategory['_id'] | ICategory
	subCategories: ICategory['_id'][]
	products: IProduct['_id'][]

	// get methods
	getParent: () => Promise<ICategory>
	getCatalog: () => Promise<ICatalog>
	getSubCategory: (query: object) => Promise<ICategory>
	getProduct: (query: object) => Promise<IProduct>

	// add methods
	addSubCateory: (productId: ICategory['_id'], options?: AddOptions) => Promise<ServerError | void>
	addProduct: (productId: IProduct['_id'], options?: AddOptions) => Promise<ServerError | void>

	// set methods
	setParent: (categoryId: ICategory['_id'] | null, options?: AddOptions) => Promise<ServerError | void>

	// remove methods
	removeSubCateory: (categoryId: ICategory['_id']) => Promise<void>
	removeProduct: (productId: IProduct['_id']) => Promise<void>

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

CategorySchema.pre('save', function(this: ICategory, next: Function) {
	// New Category
	if (this.isNew) {
		this.wasNew = false
		console.log(chalk.magenta('CategorySchema pre save ' + this.id))
		console.log(chalk.yellow('is new!'))
		this.wasNew = this.isNew

		// Check if category in catalog
		// Update catalog.categories
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
