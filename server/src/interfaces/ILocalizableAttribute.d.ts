import { localeCode } from '../types'
import { Types, Document } from 'mongoose'
import { ILocalizedAttribute } from '.';

export interface ILocalizableAttribute extends Document {
	value: Map<localeCode, any>

	getValue(code?: localeCode): Promise<any>,
	setValue(value: any, code?: localeCode): Promise<void>,
}