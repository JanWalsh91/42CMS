import { Document, Schema } from 'mongoose'
import { IUser } from '.';

export interface ILocale extends Document {
	id: string,
	language: string,
	country: string,
	fallback: ILocale['_id'] | ILocale,

	// to methods
	toJsonForUser: (user: IUser) => Promise<any>
}
