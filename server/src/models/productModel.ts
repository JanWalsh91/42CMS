import { Schema, Document, Model, model } from 'mongoose'
import chalk from 'chalk';

import { ICatalog, Catalog, ICategory } from './';
import { InternalError } from '../utils';

class ProductClass {
	// ==== set ====
	async setPrimaryCategoryByCatalog(this: IProduct, category: ICategory | null, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.setPrimaryCategoryByCatalog] category; ${category.id}, catalog: ${catalog.id}, product: ${this.id}`))
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'primaryCategoryByCatalog.catalog'},
			{path: 'primaryCategoryByCatalog.category'},
		]).execPopulate()

		let currentPrimaryCategoryByCatalog = this.primaryCategoryByCatalog.find(x => x.catalog.id == catalog.id)
		if (!currentPrimaryCategoryByCatalog) {
			console.log('new entry')
			currentPrimaryCategoryByCatalog = { catalog, category }
			this.primaryCategoryByCatalog.push(currentPrimaryCategoryByCatalog)
		} else {
			console.log('update entry')
			currentPrimaryCategoryByCatalog.category = category
		}
		this.primaryCategoryByCatalog.forEach(x => {
			console.log(x.catalog.id + ' => ' + x.category.id)
		})
		this.markModified('primaryCategoryByCatalog')
	}

	// ==== get ====
	async getMasterCatalog(this: IProduct): Promise<ICatalog> {
		await this.populate('masterCatalog').execPopulate()
		return this.masterCatalog
	}

	// ==== add ==== 
	async addAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.addAssignedCatalog] catalog: ${catalog.id}, product: ${this.id}`))
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		if (this.assignedCatalogs.find(x => x.id == catalog.id)) {
			console.log(chalk.yellow(`Product ${this.id} already assigned to Catalog ${catalog.id}`))
			return 
		}
		this.assignedCatalogs.push(catalog)
		this.primaryCategoryByCatalog.push({ catalog, category: null })
		this.assignedCategoriesByCatalog.push({ catalog, categories: [] })
		this.markModified('assignedCatalogs')
		this.markModified('primaryCategoryByCatalog')
		this.markModified('assignedCategoriesByCatalog')
		// console.log(chalk.magenta(`[ProductModel.addAssignedCatalog] catalog: ${catalog.id}, product: ${this.id}`))
	}

	async addAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.addAssignedCategoryByCatalog] category: ${category.id}, catalog: ${catalog.id}, product: ${this.id}`))
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			throw new InternalError('Product not assigned to catalog')
		}
		let categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog.id == catalog.id)		
		if (!categoriesForCatalog.categories.find(x => x.id == category.id)) {
			categoriesForCatalog.categories.push(category)
			this.markModified('assignedCategoriesByCatalog')
		}
		// console.log(chalk.magenta(`[ProductModel.addAssignedCategoryByCatalog] category: ${category.id}, catalog: ${catalog.id}, product: ${this.id} END`))
	}

	// ==== remove ==== 
	async removeAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.removeAssignedCatalog] catalog: ${catalog.id}, product: ${this.id}`))
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		this.assignedCatalogs = this.assignedCatalogs.filter(x => x.id != catalog.id)
		this.primaryCategoryByCatalog = this.primaryCategoryByCatalog.filter(x => x.catalog.id != catalog.id)
		this.assignedCategoriesByCatalog = this.assignedCategoriesByCatalog.filter(x => x.catalog.id != catalog.id)
		this.markModified('assignedCatalogs')
		this.markModified('primaryCategoryByCatalog')
		this.markModified('assignedCategoriesByCatalog')
		// console.log(chalk.magenta(`[ProductModel.removeAssignedCatalog] catalog: ${catalog.id}, product: ${this.id} END`))
	}

	async removeAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.removeAssignedCategoryByCatalog] catalog: ${catalog.id}, category: ${category.id}, product: ${this.id}`))
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			console.log(`Catalog ${catalog.id} not found`)
			return
		}
		let categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog.id == catalog.id)		
		if (categoriesForCatalog && categoriesForCatalog.categories.find(x => x.id == category.id)) {
			categoriesForCatalog.categories = categoriesForCatalog.categories.filter(x => x.id != category.id)
			this.markModified('assignedCategoriesByCatalog')
		}
		// console.log(chalk.magenta(`[ProductModel.removeAssignedCategoryByCatalog] catalog: ${catalog.id}, category: ${category.id}, product: ${this.id} END`))
	}
}

export interface IProduct extends Document {
	id: string
	name: string
	masterCatalog: ICatalog['_id'] | ICatalog
	assignedCatalogs: (ICatalog['_id'] | ICatalog)[]
	primaryCategoryByCatalog: {
		catalog: ICatalog['_id'] | ICatalog,
		category: ICategory['_id'] | ICategory
	}[]
	assignedCategoriesByCatalog: {
		catalog: ICatalog['_id'] | ICatalog,
		categories: (ICategory['_id'] | ICategory)[]
	}[]

	// set methods
	setPrimaryCategoryByCatalog: (categoryId: ICategory | null, catalogId: ICatalog) => Promise<void>

	// add methods
	addAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	addAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>
	
	// remove methods
	removeAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	removeAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>

	// internal attributes
	wasNew: boolean
}

const ProductSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true
	},
	masterCatalog: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		required: true,
	},
	assignedCatalogs: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Catalog',
			unique: true,
		}],
		default: [],
	},
	assignedCategoriesByCatalog: [new Schema({
		catalog: {
			type: Schema.Types.ObjectId,
			ref: 'Catalog'
		},
		categories: [{
			type: Schema.Types.ObjectId,
			ref: 'Category',
			unique: true,
		}]
	}, {_id: false, minimize: false})],
	primaryCategoryByCatalog: [new Schema({
		catalog: {
			type: Schema.Types.ObjectId,
			ref: 'Catalog'
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: 'Category'
		}
	}, {_id: false, minimize: false})]
}).loadClass(ProductClass)

export const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema)
