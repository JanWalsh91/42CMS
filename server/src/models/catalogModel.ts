import { Schema, Document, Model, model, Query } from 'mongoose'

import { ICategory, Category } from './categoryModel'
import { IProduct } from './productModel';
import { IProject, Project } from './projectModel';
import { ISite } from './siteModel';
import chalk from 'chalk';
import { ServerError, ErrorType } from '../utils/ServerError';
import { IUser } from './userModel';
import { MongoError } from 'mongodb';
// import { hasUniqueIdInProject } from './commonValidators';

class CatalogClass {
	// define virtuals here

	getCategory(this: ICatalog, query: Query<ICatalog>): Promise<ICategory> {
		console.log(chalk.magenta('[getCategory]'), query)
		return new Promise((resolve, reject) => {
			Category.findOne({catalog: this._id, ...query}, (err, category: ICategory) => {
				if (category) {
					resolve(category)
				}
				resolve()
			})
		})
	}

	getProduct(this: ICatalog, query: object): IProduct {
		return null
	}

	addCatalog() {

	}

	removeCatalog() {

	}

	toJSONfor(this: ICatalog, user: IUser) {
		return {
			id: this.id,
			name: this.name, 
			categories: this.categories,
			rootCategory: this.rootCategory,
			isMaster: this.isMaster,
		}
	}
}

export interface ICatalog extends Document {
	id: string,
	name: string,
	project: IProject['_id'],
	sitesAssignedTo: [ISite['_id']],
	rootCategory: ICategory['_id'],
	categories: [ICategory['_id']],
	/**
	 * Determines if this catalog owns products, or if products are assigned to it (cannot do both)
	 * Products can only be owned by one Catalog, but can be assigned to many
	 */
	isMaster: boolean,

	getCategory: (query: object) => ICategory,
	getProduct: (query: object) => IProduct,

	wasNew: boolean, // internal use
}

export const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
		// validate: [
		// 	<any>hasUniqueIdInProject()
		// ],
	},
	name: {
		type: String,
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true,
	},
	sitesAssignedTo: [{
		type: Schema.Types.ObjectId,
		ref: 'Site',
	}],
	isMaster: {
		type: Boolean,
		required: true,
		default: false,
	},
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
})
.loadClass(CatalogClass)

// 'On create' middleware
CatalogSchema.pre('save', async function(this: ICatalog, next: any) {
	console.log(chalk.magenta('CatalogSchema pre save', this.id))
	if (this.isNew) {
		this.wasNew = true
		console.log(chalk.yellow('is new!'))
		// Get project
		// Populate project with catalogs
		let project: IProject = await Project.findById(this.project).populate('catalogs');
		// Check if catalog exists in project
		if (project.catalogs.some((catalog: ICatalog) => catalog.id == this.id)) {
			throw new ServerError(ErrorType.CATALOG_EXISTS, this.id)
		}
		await project.updateOne({ $addToSet: { catalogs: this._id } }).exec()
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

		// TODO: Add catalog to project.catalogs
		await this.save()
	}
	console.log(chalk.magenta('CatalogSchema post save END'))
	next()
})

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)