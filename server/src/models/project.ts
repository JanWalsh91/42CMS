import { Schema, Document, Model, model } from 'mongoose';

import { IUser } from './user';

class ProjectClass {

}

export interface IProject extends Document {
	name: string,
	owner: IUser['_id']
}

const ProjectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}).loadClass(ProjectClass)	

export const Project: Model<IProject> = model('Project', ProjectSchema);