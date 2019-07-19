import { Schema, Document, Model, model } from 'mongoose'

import { ICategory } from './categoryModel'
import { IProduct } from './productModel';
import { IProject, Project } from './projectModel';
import { ISite } from './siteModel';
import chalk from 'chalk';

class CatalogClass {
	// define virtuals here
	getCategory(this: ICatalog, query: object): ICategory {
		return this.rootCategory.categories.find((category: ICategory) =>
			Object.keys(query).every(key => category[key] == query[key])
		)
	}

	getProduct(this: ICatalog, query: object): IProduct {
		return null
	}

	addCatalog() {

	}

	removeCatalog() {

	}
}

export interface ICatalog extends Document {
	id: string,
	name: string,
	project: IProject['_id'],
	sitesAssignedTo: [ISite['_id']],
	rootCategory: ICategory['_id'],
	/**
	 * Determines if this catalog owns products, or if products are assigned to it (cannot do both)
	 * Products can only be owned by one Catalog, but can be assigned to many
	 */
	isMaster: boolean,

	getCategory: (query: object) => ICategory,
	getProduct: (query: object) => IProduct,
}

export const CatalogSchema = new Schema({
	id: {
		type: String,
		required: true,
		validate:[{
			isAsync: true,
			validator: async function(v, cb) {
				console.log(chalk.red('Catalog.id validation'))
				// must be unique in project
				let project: IProject = await Project.findById(this.project).populate('catelogs').populate('owner');
				console.log('project: ', project)
				cb(false)
			},
		}],
	},
	name: {
		type: String,
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true,
		default: null,
	},
	sitesAssignedTo: [{
		type: Schema.Types.ObjectId,
		ref: 'Site',
		default: null
	}],
	isMaster: {
		type: Boolean,
		required: true, 
	},
	rootCategory: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		// required: true,
		// default: {
		// 	id: 'root',
		// 	catalog: this
		// }
	},
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: null
	}],
}).loadClass(CatalogClass)

export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)