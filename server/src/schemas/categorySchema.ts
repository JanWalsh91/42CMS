import { Schema } from 'mongoose'

import { ICatalog, ICategory, IProduct } from '../interfaces'
import { Category, Product } from '../models'
import { ResourceNotFoundError } from '../utils'

const categorySchema = new Schema({
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
		required: true,
		immutable: true,
	},
	parent: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: null,
	},
	subCategories: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Category',
		}],
		default: []
	},
	products: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Product',
		}],
		default: []
	},
})	

categorySchema.methods = {
	// ==== set ====
	async setId(this: ICategory, id: string): Promise<ICategory> {
		this.id = id
		return this
	},
	async setName(this: ICategory, name: string): Promise<ICategory> {
		this.name = name
		return this
	},
	async setParent(this: ICategory, category: ICategory | null): Promise<void> {
		if (category === null) {
			this.parent = null
			this.markModified('parent')
		} else {
			if (!category) {
				throw new ResourceNotFoundError('Category', '')
			}
			if (category._id === (this.populated('parent') ? this.parent._id : this.parent)) {
				return 
			}
			this.parent = category._id
			this.markModified('parent')
		}
	},

	// ==== get ====
	async getParent(this: ICategory): Promise<ICategory> {
		await this.populate('parent').execPopulate()
		return this.parent
	},
	async getCatalog(this: ICategory): Promise<ICatalog> {
		await this.populate('catalog').execPopulate()
		return this.catalog
	},
	async getSubCategory(this: ICategory, query: object): Promise<ICategory> {
		return await Category.findOne({ catalog: this.populated('catalog') ? this.catalog._id : this.catalog, parent: this._id, ...query })
	},
	async getProduct(this: ICategory, query: object): Promise<IProduct> {
		await this.populate('catalog').execPopulate()
		return await Product.findOne({ catalog: this.catalog._id, category: this._id, ...query })
	},

	// ==== add ====
	async addSubCategory(this: ICategory, category: ICategory): Promise<ICategory> {
		if (!category) {
			throw new ResourceNotFoundError('Category', '')
		}
		if (category._id in this.subCategories) {
			return this
		}
		this.subCategories.push(category._id)
		this.markModified('subCategories')
		return this
	},

	async addProduct(this: ICategory, product: IProduct): Promise<ICategory> {
		await this.populate([{path: 'catalog', populate: {path: 'products'}}, {path: 'products'}]).execPopulate()
		if (this.products.find(x => x.id == product.id)) {
			return this
		}
		if (this.catalog.products.find(x => x.id == product.id)) {
			this.products.push(product)
			this.markModified('products')
		} else {
			throw new ResourceNotFoundError('Product', product.id)
		}
		return this
	},

	// ==== remove ====
	async removeSubCategory(this: ICategory, category: ICategory): Promise<ICategory> {
		await this.populate('subCategories').execPopulate()
		if (this.subCategories.some(x => x._id.equals(category._id))) {
			this.subCategories = this.subCategories.filter(x => !x._id.equals(category._id))
			this.markModified('subCategories')
		}
		return this
	},

	async removeProduct(this: ICategory, product: IProduct): Promise<ICategory> {
		await this.populate('products').execPopulate()
		if (this.products.find(x=> x.id == product.id)) {
			this.products = this.products.filter(x => x.id !== product.id)
			this.markModified('products')
		}
		return this
	},
}

categorySchema.plugin(require('mongoose-autopopulate'))

export { 
	categorySchema,
}