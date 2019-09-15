import { Types, Document } from 'mongoose'

import { localeCode } from '../types'

export interface ILocalizableAttribute extends Document {
	value: Map<localeCode, any>

	getValue(code?: localeCode): Promise<any>,
	$set(value: any, code?: localeCode): Promise<void>,
	$add(value: any, code?: localeCode): Promise<void>,
	$remove(value: any, code?: localeCode): Promise<void>,
}