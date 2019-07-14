import { Schema, Document, Model, model, SchemaType } from 'mongoose';

import { IUser } from './userModel';
import { ICatalog } from './catalogModel';
import { IProduct } from './productModel';

class ProjectClass {

}

export interface IProject extends Document {
	id: string,
	name: string,
	owner: IUser['_id'],
}

const ProjectSchema = new Schema({
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
	catalogs: {
		type: [Schema.Types.ObjectId],
		ref: 'Catalog',
	}
}).loadClass(ProjectClass)

export const Project: Model<IProject> = model('Project', ProjectSchema);