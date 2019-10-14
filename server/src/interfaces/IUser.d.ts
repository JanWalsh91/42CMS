import { Document } from 'mongoose'

export interface IUser extends Document {
	apiKey: string
	username: string
	name: string
	password: string
	created_date: Date
	admin: boolean
}