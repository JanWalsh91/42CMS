import { Document, Schema } from 'mongoose'

export interface ILocale extends Document {
	id: string,
	language: string,
	country: string,
	fallback: ILocale['_id'] | ILocale,
}
