import { localeCode } from '../types'
import { Types } from 'mongoose'
import { ILocalizedAttribute } from '.';

// export interface IAttribute extends Types.Subdocument {
// 	// property values by locale
// 	// values: Record<localeCode, string>,
// 	// values: Map<localeCode, string>
// 	_value: any
// 	localizable: boolean

// 	getValue(code?: localeCode): Promise<any>,
// 	setValue(value: any, code?: localeCode): Promise<void>,
// }


interface isLocalized {
	localizable: true
}

// this extends isString ? string : any

// export interface IAttribute<T> extends Types.Subdocument {
export interface IAttribute {
	_value: this extends isLocalized ? Map<localeCode, any> : any
	localizable: boolean
	
	getValue(code?: localeCode): Promise<any>,
	setValue(value: any, code?: localeCode): Promise<void>,
}

// declare class Attribute implements IAttribute<string> {
// 	constructor(value) {
// 		this._value = value
// 	}

// 	_value: this extends isLocalized ? Map<localeCode, string>: string
// 	localizable: boolean
// 	async getValue (code: localeCode) {
// 		return '10'
// 	}
// 	async setValue (value: string, code: localeCode) {
// 		// this._value = value
// 	}
// }

export interface ILocalizedAttribute extends IAttribute {
	localizable: true
}