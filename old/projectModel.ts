import { Schema, Document, Model, model, SchemaType } from 'mongoose';
import { ObjectId } from 'mongodb'
import { IUser } from './userModel';
import { ICatalog, CatalogSchema, Catalog } from './catalogModel';
import { IProduct, ProductSchema, Product } from './productModel';
import { ISite, SiteSchema } from './siteModel';
// import { IUser, UserSchema } from './userModel';

import { ModelUpdateOptions } from '../types/ModelUpdateOptions';

import { ServerError, ErrorType } from '../utils/ServerError' 
import chalk from 'chalk';

class ProjectClass {
	// define virtuals here
	async getCatalog(this: IProject, query: object): Promise<ICatalog> {
		return await Catalog.findOne({ project: this._id, ...query })
	}

	async getProduct(this: IProject, query: object): Promise<IProduct> {
		return await Product.findOne({ project: this._id, ...query })
	}

	async addCatalog(this: IProject, catalogId: ICatalog['id'], options: ModelUpdateOptions = {}): Promise<ServerError | void>  {
		console.log(chalk.magenta(`[ProjectModel.addCatalog] ${catalogId} to ${this._id}`))
		if (!options.skipCheckExists) {
			const catalog: ICatalog = await Catalog.findById(catalogId)
			if (!catalog) {
				throw new ServerError(ErrorType.CATALOG_NOT_FOUND)
			}
		}
		if (catalogId in this.catalogs) {
			console.log(chalk.yellow('[ProjectModel.addCatalog] catalog already in project'))
			return 
		}
		this.catalogs.push(catalogId)
		this.markModified('catalogs')
	}

	async addProduct(this: IProject, productId: IProduct['_id'], options: ModelUpdateOptions = {}): Promise<ServerError | void> {
		console.log(chalk.magenta(`[ProjectModel.addProduct] ${productId} to ${this._id}`))
		if (!options.skipCheckExists) {
			const product: IProduct = await Product.findById(productId)
			if (!product) {
				throw new ServerError(ErrorType.PRODUCT_NOT_FOUND)
			}
		}
		if (productId in this.products) {
			console.log(chalk.yellow('[ProjectModel.addProduct] product already in project'))
			return 
		}
		this.products.push(productId)
		this.markModified('products')
	}

	async removeProduct(this: IProject, productId: IProduct['_id']) {
		console.log(chalk.magenta(`[ProjectModel.removeProduct] ${productId} from ${this._id}`))
		if (productId in this.products) {
			this.products = this.products.filter(x => x !== productId)
			this.markModified('products')
		} else {
			console.log(chalk.yellow(`[ProjectModel.removeProduct] ${productId} not in ${this._id}`))
		}
	}

	async removeCatalog(this: IProject, catalogId: ICatalog['_id']) {
		console.log(chalk.magenta(`[ProjectModel.removeCatalog] ${catalogId} from ${this._id}`))
		if (catalogId in this.catalogs) {
			this.catalogs = this.catalogs.filter(x => x !== catalogId)
			this.markModified('catalogs')
		} else {
			console.log(chalk.yellow(`[ProjectModel.removeCatalog] ${catalogId} not in ${this._id}`))
		}
	}

	// getSite(this: ISite, query: object): ISite {}
	// getUser(this: IUser, query: object): IUser {}
}

export interface IProject extends Document {
	id: string,
	name: string,
	owner: IUser['_id'],
	// users: [IUser['_id']],
	catalogs: ICatalog['_id'][],
	products: IProduct['_id'][],
	sites: ISite['_id'][],
	
	// get methods
	getCatalog: (query: object) => Promise<ICatalog>,
	getProduct: (query: object) => Promise<IProduct>,
	
	// add methods
	addCatalog: (catalog: ICatalog['_id'], options: ModelUpdateOptions) => Promise<ServerError | void>,
	addProduct: (product: IProduct['_id'], options: ModelUpdateOptions) => Promise<ServerError | void>,

	// remove methods
	removeCatalog: (catalog: ICatalog['_id']) => Promise<void>,
	removeProduct: (product: IProduct['_id']) => Promise<void>,

	// getSite: (query: object) => ISite,
	// getUser: (query: object) => IUser,
}

export const ProjectSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	catalogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		default: null
	}],
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
		default: null
	}],
	sites: [{
		type: Schema.Types.ObjectId,
		ref: 'Site',
		default: null
	}],
	// Users: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Users',
	// 	default: null
	// }],

}).loadClass(ProjectClass)

export const Project: Model<IProject> = model('Project', ProjectSchema)