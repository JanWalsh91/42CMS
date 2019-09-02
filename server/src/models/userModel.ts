import { Schema, Model, model }  from 'mongoose';

import { IUser } from '../interfaces' 

const UserSchema = new Schema({
	apiKey: {
		type: String,
		required: 'Need an apiKey',
		immutable: true,
	},
	username: {
		type: String,
		required: 'Enter a username',
		unique: true,
		min: [5, 'Username too short']
	},
	name: {
        type: String,
    },
	password: {
		type: String,
		required: 'Enter a password',
	},
    created_date: {
        type: Date,
		default: Date.now,
		immutable: true,
	},
	admin: {
		type: Boolean,
		default: false,
		required: true
	}
})

UserSchema.methods = {

}

export const User: Model<IUser> = model('User', UserSchema)
