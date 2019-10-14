import { Schema } from 'mongoose'

import { ICatalog, ICategory, IProduct, IObjectTypeDefinition } from '../interfaces'
import { InternalError } from '../utils'
import { objectTypeDefinitionService } from '../services'
import { LocalizableAttribute } from '../models'
import productTypes from '../resources/productTypes'

const productSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	type: {
		type: String,
		enum: productTypes,
		default: 'basic',
	},
	name: {
		type: Schema.Types.ObjectId,
		ref: 'LocalizableAttribute',
		autopopulate: true,
		defaultType: 'string', // used to initialize the ObjectTypeDefinition,
	},
	masterCatalog: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
	},
	assignedCatalogs: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Catalog',
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
	}, {_id: false, minimize: false})],
	description: {
		type: Schema.Types.ObjectId,
		ref: 'LocalizableAttribute',
		autopopulate: true,
		defaultType: 'string',
	},
	custom: {
		type: Map,
		of: {
			type: Schema.Types.ObjectId,
			ref: 'LocalizableAttribute',
			autopopulate: true,
		},
		default: new Map(),
	}
})

productSchema.methods = {
	// ==== is ====
	isMaster(this: IProduct): boolean {
		return this.type === 'master'
	} ,
	isVariant(this: IProduct): boolean {
		return this.type === 'variant'
	} ,
	isBasic(this: IProduct): boolean {
		return this.type === 'basic'
	} ,
	
	// ==== set ====
	setId(this: IProduct, id: string): void {
		this.id = id
	},
	async setPrimaryCategoryByCatalog(this: IProduct, category: ICategory | null, catalog: ICatalog): Promise<void> {
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'primaryCategoryByCatalog.catalog'},
			{path: 'primaryCategoryByCatalog.category'},
		]).execPopulate()

		let currentPrimaryCategoryByCatalog = this.primaryCategoryByCatalog.find(x => x.catalog.id == catalog.id)
		if (!currentPrimaryCategoryByCatalog) {
			currentPrimaryCategoryByCatalog = { catalog, category }
			this.primaryCategoryByCatalog.push(currentPrimaryCategoryByCatalog)
		} else {
			currentPrimaryCategoryByCatalog.category = category
		}
		this.markModified('primaryCategoryByCatalog')
	},

	// ==== get ====
	getObjectTypeDefinition(this: IProduct): Promise<IObjectTypeDefinition> {
		return objectTypeDefinitionService.getById('Product')
	},
	async getMasterCatalog(this: IProduct): Promise<ICatalog> {
		await this.populate('masterCatalog').execPopulate()
		return this.masterCatalog
	},
	async getPrimaryCategoryByCatalog(this: IProduct, catalog: ICatalog): Promise<ICategory> {
		await this.populate([
			{ path: 'primaryCategoryByCatalog.catalog '},
			{ path: 'primaryCategoryByCatalog.category '},
		]).execPopulate()

		let match = this.primaryCategoryByCatalog.find(x => x.catalog.id == catalog.id)
		
		if (match) {
			return match.category 
		} else {
			return null
		}
	},

	// ==== add ==== 
	async addAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		if (this.assignedCatalogs.find(x => x.id == catalog.id)) {
			return 
		}
		this.assignedCatalogs.push(catalog)
		this.primaryCategoryByCatalog.push({ catalog, category: null })
		this.assignedCategoriesByCatalog.push({ catalog, categories: [] })
		this.markModified('assignedCatalogs')
		this.markModified('primaryCategoryByCatalog')
		this.markModified('assignedCategoriesByCatalog')
	},
	async addAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
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
	},

	// ==== remove ==== 
	async removeAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
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
	},
	async removeAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
		await this.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			return
		}
		let categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog.id == catalog.id)		
		if (categoriesForCatalog && categoriesForCatalog.categories.find(x => x.id == category.id)) {
			categoriesForCatalog.categories = categoriesForCatalog.categories.filter(x => x.id != category.id)
			this.markModified('assignedCategoriesByCatalog')
		}
	},
}

productSchema.plugin(require('mongoose-autopopulate'))

productSchema.pre('save', async function(this: IProduct) {
	if (this.isNew) {
		await ['name', 'description'].reduce((_: Promise<any>, path: string) =>
			_.then(async() => {
				this[path] = await new LocalizableAttribute().save()
			}
		), Promise.resolve())
		await objectTypeDefinitionService.initExtensibleObject(this)
	}
})

productSchema.pre('find', <any>async function(products: IProduct[]) {
	for (let product of products) {
		await product.populate('custom').execPopulate()
	}
})
productSchema.pre('findOne', function(this: IProduct) {
	this.populate('custom')
})

export {
	productSchema,
}