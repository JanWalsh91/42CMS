import { Schema, Model, model } from 'mongoose'
import chalk from 'chalk';

import { ICatalog, ICategory, IProduct } from '../interfaces'
import { Category, Product } from '.'

const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
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
		unique: true,
	}],
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		// default: null,
		// unique: true,
	}],
	master: {
		type: Boolean,
		required: true,
		default: false,
	},
}, {id: false})

CatalogSchema.methods = {
	// ==== set ====
	async setId(this: ICatalog, id: string): Promise<ICatalog> {
		this.id = id
		return this
	},
	async setName(this: ICatalog, name: string): Promise<ICatalog> {
		this.name = name
		return this
	},

	// ==== get ====
	async getCategory(this: ICatalog, query: object): Promise<ICategory> {
		return await Category.findOne({ catalog: this._id, ...query }).exec()
	},
	async getProduct(this: ICatalog, query: object): Promise<IProduct> {
		return await Product.findOne({ masterCatalog: this._id, ...query }).exec()
	},

	// ==== add ====
	async addCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addCategory] ${category.id} to ${this.id}`))
		this.categories.push(category._id)
		this.markModified('categories')
		return this
	},
	async addProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		this.products.push(product._id)
		this.markModified('products')
		return this
	},

	// ==== remove ====
	async removeCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${this.id}`))
		await this.populate('categories').execPopulate()
		this.categories = this.categories.filter(x => !x._id.equals(category._id))
		this.markModified('categories')
		return this
	},
	async removeProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		this.products = this.products.filter(x => !x._id.equals(product._id))
		this.markModified('products')
		return this
	},
}

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
		// Create 'root' category

		// TODO: use service ? Or move to service
		const rootCategory: ICategory = await new Category({id: 'root', catalog: this._id})
		await rootCategory.save()

		this.rootCategory = rootCategory._id
		this.categories.push(rootCategory._id)
		this.markModified('categories')

		await this.save()
	}
	next()
})

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)