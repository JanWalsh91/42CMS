import { Document, Schema } from 'mongoose'

import { IUser } from '.'

export interface ILocale extends Document {
	id: string
	language: string
	country: string
	fallback: ILocale['_id'] | ILocale

	// ==== to ====
	toJsonForUser: (user: IUser) => Promise<any>

	// ==== set ====
	setFallback: (locale: ILocale) => void
}
