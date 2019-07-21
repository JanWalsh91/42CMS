import { Schema, Document, Model, model, SchemaType } from 'mongoose';

import { IUser } from './userModel';
import { ICatalog, CatalogSchema, Catalog } from './catalogModel';
import { IProduct, ProductSchema } from './productModel';
import { ISite, SiteSchema } from './siteModel';
// import { IUser, UserSchema } from './userModel';

import { ServerError, ErrorType } from '../utils/ServerError' 
import chalk from 'chalk';

class ProjectClass {
	// define virtuals here
	async getCatalog(this: IProject, query): Promise<ICatalog> {
		return new Promise((resolve, reject) => {
			Catalog.findOne({ project: this._id, ...query}, (err, catalog: ICatalog) => {
				resolve(catalog)
			})
		})
	}

	// getSite(this: ISite, query: object): ISite {}
	// getUser(this: IUser, query: object): IUser {}
}

export interface IProject extends Document {
	id: string,
	name: string,
	owner: IUser['_id'],
	// users: [IUser['_id']],
	catalogs: [ICatalog['_id']],
	products: [IProduct['_id']],
	sites: [ISite['_id']],

	getCatalog: (query: object) => Promise<ICatalog>,
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