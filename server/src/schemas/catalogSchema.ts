import { Schema } from 'mongoose'
import chalk from 'chalk'

import { ICatalog, ICategory, IProduct, ISite } from '../interfaces'
import { Category, Product } from '../models'

const catalogSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
	},
	sites: [{
		type: Schema.Types.ObjectId,
		ref: 'Site',
		default: [],
	}],
	rootCategory: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
	},
	categories: [{
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: [],
	}],
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: [],
	}],
	master: {
		type: Boolean,
		required: true,
		default: false,
	},
})

catalogSchema.methods = {
	// ==== to ====
	async toJSONForClient(this: ICatalog): Promise<object> {
		await this.populate([
			{ path: 'sites' },
			{ path: 'rootCategory' },
			{ path: 'categories' },
			{ path: 'products' },
		]).execPopulate()
		
		let obj: any = {
			id: this.id,
			name: this.name,
			sites: this.sites.map((site: ISite) => site.id),
			rootCategory: this.rootCategory ? this.rootCategory.id : null,
			categories: this.categories.map((category: ICategory) => category.id),
			products: this.products.map((product: IProduct) => product.id),
			master: this.master,
		}

		return obj
	},

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
		await this.populate('categories').execPopulate()
		if (this.categories.every(x => x.id != category.id)) {
			this.categories.push(category._id)
			this.markModified('categories')
		}
		return this
	},
	async addProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		if (this.products.every(x => x.id != product.id)) {
			this.products.push(product._id)
			this.markModified('products')
		}
		return this
	},
	async addSite(this: ICatalog, site: ISite): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.addSite] ${site.id} to ${this.id}`))
		await this.populate('sites').execPopulate()
		if (this.sites.every(x => x.id != site.id)) {
			this.sites.push(site._id)
			this.markModified('sites')
		}
		return this
	},

	// ==== remove ====
	async removeCategory(this: ICatalog, category: ICategory): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${this.id}`))
		await this.populate('categories').execPopulate()
		if (this.categories.some(x => x.id == category.id)) {
			this.categories = this.categories.filter(x => !x._id.equals(category._id))
			this.markModified('categories')
		}
		return this
	},
	async removeProduct(this: ICatalog, product: IProduct): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeProduct] ${product.id} to ${this.id}`))
		await this.populate('products').execPopulate()
		if (this.products.some(x => x.id == product.id)) {
			this.products = this.products.filter(x => !x._id.equals(product._id))
			this.markModified('products')
		}
		return this
	},
	async removeSite(this: ICatalog, site: ISite): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogModel.removeSite] ${site.id} to ${this.id}`))
		await this.populate('sites').execPopulate()
		if (this.sites.some(x => x.id == site.id)) {
			this.sites = this.sites.filter(x => !x._id.equals(site._id))
			this.markModified('sites')
		}
		return this
	},
	
}

// 'On create' middleware
catalogSchema.pre('save', async function(this: ICatalog, next: any) {
	if (this.isNew) {
		this.wasNew = true
	}
	next()
});

catalogSchema.post('save', async function(this: ICatalog, doc: ICatalog, next: any) {
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

catalogSchema.plugin(require('mongoose-autopopulate'))

export { 
	catalogSchema,
}