import { Schema, Document, Model, model, Query } from 'mongoose'

import { ICategory, Category } from './categoryModel'
import { IProduct } from './productModel';
import { IProject, Project } from './projectModel';
import { ISite } from './siteModel';
import chalk from 'chalk';
import { ServerError, ErrorType } from '../utils/ServerError';
import { IUser } from './userModel';
// import { hasUniqueIdInProject } from './commonValidators';

class CatalogClass {
	// define virtuals here
	static async create(project: IProject, id: string, name: string): Promise<ICatalog | void> { // TODO: change to ICatalog
		let newCatalog: ICatalog = new Catalog({ id, name, project: project._id });

		project = await project.populate('catalogs').execPopulate();
		
		// Check if catalog exists in project
		if (project.catalogs.some((catalog: ICatalog) => catalog.id == newCatalog.id)) {
			throw new ServerError(ErrorType.CATALOG_EXISTS, newCatalog.id)
		}

		// Create catalog
		newCatalog = await newCatalog.save()

		// Create root category
		const rootCategory: ICategory = await Category.create(newCatalog, 'root', null)
		
		// Set root category as catalog root
		newCatalog.rootCategory = rootCategory._id
		newCatalog = await newCatalog.save()

		// Add catalog to project.catalogs
		await project.updateOne({ $addToSet: { catalogs: newCatalog._id } },)
		return newCatalog
	}

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
	categories: {
		type: [Schema.Types.ObjectId],
		ref: 'Category',
	},
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: null
	}],
})
.loadClass(CatalogClass)
// .pre('save', async () => {
// 	console.log(chalk.magenta('[catalogModel] pre save HOOK'), this)
// 	console.log(chalk.magenta('[catalogModel] pre save HOOK END'))
// })
export const Catalog: Model<ICatalog> = model('Catalog', CatalogSchema)