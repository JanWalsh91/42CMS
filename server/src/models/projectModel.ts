import { Schema, Document, Model, model, SchemaType } from 'mongoose';

import { IUser } from './userModel';
import { ICatalog, CatalogSchema } from './catalogModel';
import { IProduct, ProductSchema } from './productModel';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';
import { ISite, SiteSchema } from './siteModel';
// import { IUser, UserSchema } from './userModel';

class ProjectClass {
	// define virtuals here
	getCatalog(this: IProject, query): ICatalog {
		for (let i = 0; i < this.catalogs.length; i++) {
			let catalog = this.catalogs[i]
			if (Object.keys(query).every(key => catalog[key] == query[key])) {
				return catalog
			}
		}
		return null;
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
	sites: [ISite['_id']],

	getCatalog: (query: object) => ICatalog,
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
		ref: 'Catalogs',
		default: null
	}],
	sites: [{
		type: Schema.Types.ObjectId,
		ref: 'Sites',
		default: null
	}],
	// Users: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Users',
	// 	default: null
	// }],

}).loadClass(ProjectClass)

export const Project: Model<IProject> = model('Project', ProjectSchema)