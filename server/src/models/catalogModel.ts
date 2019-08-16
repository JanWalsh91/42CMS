import { Schema, Document, Model, model, Query } from 'mongoose'

import { ICategory, Category } from '../models'
import { IProduct, Product } from './productModel';
// import { ISite } from './siteModel';

import chalk from 'chalk';
import { IUser } from './userModel';
import { ModelUpdateOptions } from '../utils/ModelUpdateOptions';

class CatalogClass {
	// define virtuals here

	async getCategory(this: ICatalog, query: object): Promise<ICategory> {
		return await Category.findOne({ catalog: this._id, ...query })
	}

	// async getProduct(this: ICatalog, query: object): Promise<IProduct> {
	// 	return await Product.findOne({ catalog: this._id, ...query })
	// }

	// async getRootCategory(this: ICatalog): Promise<ICategory> {
	// 	await this.populate('rootCategory').execPopulate()
	// 	return this.rootCategory;
	// }

	// /**
	//  * Check if: 
	//  * - doesn't yet exist in catalog 
	//  */
	async addCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addCategory] ${category.id} to ${this._id}`))
		if (category._id in this.categories) {
			console.log(chalk.yellow('[CatalogModel.addCategory] category already in catalog'))
			return 
		}
		this.categories.push(category._id)
		this.markModified('categories')
		return this.save()
	}

	// /**
	//  * Check if: 
	//  * - doesn't yet exist in catalog 
	//  */
	// async addProduct(this: ICatalog, productId: IProduct['_id'], options: ModelUpdateOptions = {}): Promise<ServerError | void> {
	// 	console.log(chalk.magenta(`[CatalogModel.addProduct] ${productId} to ${this._id}`))
	// 	// check if exists ? (needed?)
	// 	if (!options.skipCheckExists) {
	// 		// await this.getProject()
	// 		// const product: IProduct = await this.project.getProduct({ _id: productId })
	// 		// if (!product) {
	// 		// 	throw new ServerError(ErrorType.PRODUCT_NOT_FOUND)
	// 		// }
	// 	}
	// 	if (productId in this.products) {
	// 		console.log(chalk.yellow('[CatalogModel.addProduct] product already in catalog'))
	// 		return 
	// 	}
	// 	this.products.push(productId)
	// 	this.markModified('products')
	// }

	async removeCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${this._id}`))
		if (category._id in this.categories) {
			this.categories = this.categories.filter(x => x !== category._id)
			this.markModified('categories')
			return this.save()
		} else {
			console.log(chalk.yellow(`[CatalogModel.removeCategory] ${category.id} not in ${this._id}`))
		}
	}

	// async removeProduct(this: ICatalog, productId: IProduct['_id']) {
	// 	console.log(chalk.magenta(`[CatalogModel.removeProduct] ${productId} from ${this._id}`))
	// 	if (productId in this.products) {
	// 		this.products = this.products.filter(x => x !== productId)
	// 		this.markModified('products')
	// 	} else {
	// 		console.log(chalk.yellow(`[CatalogModel.removeProduct] ${productId} not in ${this._id}`))
	// 	}
	// }

	// toJSONfor(this: ICatalog, user: IUser) {
	// 	return {
	// 		id: this.id,
	// 		name: this.name, 
	// 		categories: this.categories,
	// 		rootCategory: this.rootCategory,
	// 		isMaster: this.isMaster,
	// 	}
	// }
}

export interface ICatalog extends Document {
	id: string
	name: string
	// sitesAssignedTo: ISite['_id'][]
	rootCategory: ICategory['_id']
	categories: ICategory['_id'][]
	// products: IProduct['_id'][]
	/**
	 * Determines if this catalog owns products, or if products are assigned to it (cannot do both)
	 * Products can only be owned by one Catalog, but can be assigned to many
	 */
	isMaster: boolean

	
	// get methods
	getRootCategory: () => Promise<ICategory>
	getCategory: (query: object) => Promise<ICategory>
	// getProduct: (query: object) => Promise<IProduct>
	
	// add methods
	addCategory: (category: ICategory['_id']) => Promise<ICatalog>
	// addProduct: (product: IProduct['_id'], options: ModelUpdateOptions) => Promise<void>

	// remove methods
	removeCategory: (category: ICategory['_id']) => Promise<ICatalog>
	// removeProduct: (product: IProduct['_id']) => Promise<void>

	wasNew: boolean // internal use
}

export const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	// sitesAssignedTo: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Site',
	// }],
	rootCategory: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
	},
	categories: [{
		type: Schema.Types.ObjectId,
		ref: 'Category',
	}],
	// products: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Product',
	// 	default: null
	// }],
	isMaster: {
		type: Boolean,
		required: true,
		default: false,
	},
})
.loadClass(CatalogClass)

// 'On create' middleware
CatalogSchema.pre('save', async function(this: ICatalog, next: any) {
	console.log(chalk.magenta('CatalogSchema pre save', this.id))
	if (this.isNew) {
		this.wasNew = true
		console.log(chalk.yellow('is new!'))
	}

	next()
	// next(err) // if fail
});

// err: MongoError
CatalogSchema.post('save', async function(this: ICatalog, doc: ICatalog, next: any) {
	// New Catalog
	if (this.wasNew) {
		this.wasNew = false
		console.log(chalk.magenta('CatalogSchema post save', this.id))
		// Create 'root' category
		const rootCategory: ICategory = await new Category({id: 'root', catalog: this._id})
		await rootCategory.save()

		this.rootCategory = rootCategory._id

		await this.save()
	}
	console.log(chalk.magenta('CatalogSchema post save END'))
	next()
})

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)