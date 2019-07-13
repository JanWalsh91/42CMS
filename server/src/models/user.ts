import { Schema, Document, Model, model}  from 'mongoose';

import { IProject } from './project';

// https://mongoosejs.com/docs/advanced_schemas.html
class UserClass {
	authenticate = (name, password, callback) => {
		// User.findOne({name}, )
	}
}

export interface IUser extends Document {
	_id: string,
	apiKey: string,
	username: string,
	name: string,
	password: string,
	create_date: Date,
	projects: IProject['_id'],
}

const UserSchema = new Schema({
	apiKey: {
		type: String,
		required: 'Need an apiKey'
	},
	username: {
		type: String,
		required: 'Enter a username',
		unique: true
	},
	name: {
        type: String,
		required: 'Enter a name'
    },
	password: {
		type: String,
		required: 'Enter a password'
	},
    created_date: {
        type: Date,
        default: Date.now
	},
	projects: [{
		type: Schema.Types.ObjectId,
		ref: 'Project'
	}]
}).loadClass(UserClass)	

export const User: Model<IUser> = model('User', UserSchema);

