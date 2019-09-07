import { localeCode } from '../types'
import { Types } from 'mongoose'

export interface ILocalizableAttribute extends Types.Subdocument {
	// property values by locale
	// values: Record<localeCode, string>,
	values: Map<localeCode, string>

	getValue(code?: localeCode): Promise<string>,
	setValue(value: string, code?: localeCode): Promise<void>,
}