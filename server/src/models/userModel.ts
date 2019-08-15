import { Schema, Document, Model, model}  from 'mongoose';

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
	created_date: Date,
}

const UserSchema = new Schema({
	apiKey: {
		type: String,
		required: 'Need an apiKey',
	},
	username: {
		type: String,
		required: 'Enter a username',
		unique: true,
		min: [5, 'Username too short']
	},
	name: {
        type: String,
		required: 'Enter a name',
    },
	password: {
		type: String,
		required: 'Enter a password',
	},
    created_date: {
        type: Date,
        default: Date.now,
	}
}).loadClass(UserClass)	

export const User: Model<IUser> = model('User', UserSchema)
