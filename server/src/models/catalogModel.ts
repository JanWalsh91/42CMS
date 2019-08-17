import { Schema, Document, Model, model, Query } from 'mongoose'

import { ICategory, Category, IProduct, Product } from '../models'

import chalk from 'chalk';

class CatalogClass {
	// define virtuals here

	// ===== Category ======
	async addCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addCategory] ${category.id} to ${this.id}`))
		this.categories.push(category._id)
		this.markModified('categories')
		return this
	}

	async getCategory(this: ICatalog, query: object): Promise<ICategory> {
		return await Category.findOne({ catalog: this._id, ...query })
	}

	async removeCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${this.id}`))
		await this.populate('categories').execPopulate()
		this.categories = this.categories.filter(x => !x._id.equals(category._id))
		this.markModified('categories')
		return this
	}

	// ===== Product =====
	// Adds product regardless of master
	async addProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		this.products.push(product._id)
		this.markModified('products')
		return this
	}

	async removeProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		this.products = this.products.filter(x => !x._id.equals(product._id))
		this.markModified('products')
		return this
	}
}

export interface ICatalog extends Document {
	id: string
	name: string
	// sitesAssignedTo: ISite['_id'][]
	rootCategory: ICategory['_id'] | ICategory
	categories: (ICategory['_id'] | ICategory)[] 
	products: (IProduct['_id'] | IProduct)[]
	/**
	 * Determines if this catalog owns products, or if products are assigned to it (cannot do both)
	 * Products can only be owned by one Catalog, but can be assigned to many
	 */
	master: boolean

	
	// get methods
	getRootCategory: () => Promise<ICategory>
	getCategory: (query: object) => Promise<ICategory>
	// getProduct: (query: object) => Promise<IProduct>
	
	// add methods
	addCategory: (category: ICategory) => Promise<ICatalog>
	addProduct: (product: IProduct) => Promise<ICatalog>

	// remove methods
	removeCategory: (category: ICategory) => Promise<ICatalog>
	removeProduct: (product: IProduct) => Promise<ICatalog>

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
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: null
	}],
	master: {
		type: Boolean,
		required: true,
		default: false,
	},
})
.loadClass(CatalogClass)

// 'On create' middleware
CatalogSchema.pre('save', async function(this: ICatalog, next: any) {
	if (this.isNew) {
		this.wasNew = true
	}
	next()
});

CatalogSchema.post('save', async function(this: ICatalog, doc: ICatalog, next: any) {
	// New Catalog
	if (this.wasNew) {
		this.wasNew = false
		console.log(chalk.magenta('CatalogSchema post save', this.id))
		// Create 'root' category

		// TODO: use service ? Or move to service
		const rootCategory: ICategory = await new Category({id: 'root', catalog: this._id})
		await rootCategory.save()

		this.rootCategory = rootCategory._id
		this.categories.push(rootCategory._id)
		this.markModified('categories')

		await this.save()
		console.log(chalk.magenta('CatalogSchema post save END'))
	}
	next()
})

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)