import { IUser } from './IUser'
import { IProduct } from './IProduct'
import { IProductMaster } from './IProductMaster'
import { IProductVariant } from './IProductVariant'
import { ICatalog } from './ICatalog'
import { ICategory } from './ICategory'
import { ISite } from './ISite'
import { ILocale } from './ILocale'
import { ILocaleSettings } from './ILocaleSettings'

export {
	IUser,
	IProduct,
	IProductMaster,
	IProductVariant,
	ICatalog,
	ICategory,
	ISite,
	ILocale,
	ILocaleSettings,
}

import { Document } from 'mongoose'

export interface IAttribute {

}

/**
 * Extensible objects:
 * - product
 * - catalog
 * - category
 * 
 * Non extensible objects:
 * - site
 * - user
 *  
 * */ 
export interface IExtensibleObject {
	custom: ICustomAttribute[]

	getCustom: () => ICustomAttribute[]
}

type CustomAttributeType = string | Number // ...

export interface ICustomAttribute {
	type: 'string' | 'number' // ...
	value: CustomAttributeType
}


export interface IGlobalSettings extends Document, IExtensibleObject {
	locale: ILocaleSettings,
}

export interface ISiteSettings extends Document, IExtensibleObject {
	locale: ILocaleSettings,
}

export interface IUserSettings extends Document, IExtensibleObject {

}

// todo: specify accepted values and 'default'
type LocaleCode = string

export interface ILocalizableAttribute<T> {
	valueByLocale: Record<LocaleCode, T>
}
