import { Schema, Document, Model, model } from 'mongoose'
import chalk from 'chalk';

import { ICatalog, Catalog, IProduct, Product } from '.'
import { ResourceNotFoundError, ValidationError } from '../utils';

// Define instance methods
class CategoryClass {
	// ==== set ====
	async setId(this: ICategory, id: string): Promise<ICategory> {
		this.id = id
		return this
	}
	async setName(this: ICategory, name: string): Promise<ICategory> {
		this.name = name
		return this
	}
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

	// ==== get ====
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
	async getProduct(this: ICategory, query: object): Promise<IProduct> {
		await this.populate('catalog').execPopulate()
		return await Product.findOne({ catalog: this.catalog._id, category: this._id, ...query })
	}

	// ==== add ====
	async addSubCategory(this: ICategory, category: ICategory): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryModel.addSubCategory] ${category.id} to ${this.id}`))
		if (!category) {
			throw new ResourceNotFoundError('Category', '')
		}
		if (category._id in this.subCategories) {
			console.log(chalk.yellow('[CategoryModel.addSubCategory] category already in subCategories'))
			return this
		}
		this.subCategories.push(category._id)
		this.markModified('subCategories')
		return this
	}

	async addProduct(this: ICategory, product: IProduct): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryModel.addProduct] product: ${product.id} to category: ${this.id}`))
		await this.populate([{path: 'catalog', populate: {path: 'products'}}, {path: 'products'}]).execPopulate()
		if (this.products.find(x => x.id == product.id)) {
			console.log(chalk.yellow('[CategoryModel.addProduct] product already in category'))
			return this
		}
		if (this.catalog.products.find(x => x.id == product.id)) {
			this.products.push(product)
			this.markModified('products')
		} else {
			throw new ResourceNotFoundError('Product', product.id)
		}
		return this
	}

	// ==== remove ====
	async removeSubCategory(this: ICategory, category: ICategory): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryModel.removeSubCategory] ${category.id} from ${this.id}`))
		await this.populate('subCategories').execPopulate()
		if (this.subCategories.some(x => x._id.equals(category._id))) {
			this.subCategories = this.subCategories.filter(x => !x._id.equals(category._id))
			this.markModified('subCategories')
		} else {
			console.log(chalk.yellow(`[CategoryModel.removeSubCategory] ${category.id} not in ${this.id}`))
		}
		return this
	}

	async removeProduct(this: ICategory, product: IProduct): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryModel.removeProduct] product: ${product.id}, from category ${this.id}`))
		await this.populate('products').execPopulate()
		if (this.products.find(x=> x.id == product.id)) {
			this.products = this.products.filter(x => x.id !== product.id)
			this.markModified('products')
		} else {
			console.log(chalk.yellow(`[CategoryModel.removeProduct] ${product.id} not in ${this.id}`))
		}
		return this
	}

}

export interface ICategory extends Document {
	id: string
	name: string
	catalog: ICatalog['_id'] | ICatalog
	parent: ICategory['_id'] | ICategory
	subCategories: (ICategory['_id'] | ICategory)[]
	products: IProduct['_id'][]

	// set methods
	setId: (id: string) => Promise<ICategory>
	setName: (name: string) => Promise<ICategory>

	// get methods
	getParent: () => Promise<ICategory>
	getCatalog: () => Promise<ICatalog>
	getSubCategory: (query: object) => Promise<ICategory>
	// getProduct: (query: object) => Promise<IProduct>

	// add methods
	addSubCategory: (category: ICategory) => Promise<ICategory>
	addProduct: (productId: IProduct) => Promise<ICategory>

	// set methods
	setParent: (category: ICategory | null) => Promise<void>

	// remove methods
	removeSubCategory: (category: ICategory) => Promise<ICategory>
	removeProduct: (product: IProduct) => Promise<ICategory>

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
}, {id: false}).loadClass(CategoryClass)	

// console.log(CategorySchema)
// process.exit()

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
