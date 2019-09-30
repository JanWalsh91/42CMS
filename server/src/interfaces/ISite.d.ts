import { Document } from 'mongoose'

import { ICatalog, ILocale, IExtensibleObject, IObjectTypeDefinition } from '../interfaces'

export interface ISite extends IExtensibleObject {
	id: string,
	hostName: string,

	allowedLocales: (ILocale['_id'] | ILocale)[]
	defaultLocale: ILocale['_id'] | ILocale
	catalogs: (ICatalog['_id'] | ICatalog)[]
	
	// get methods
	getObjectTypeDefinition: () => Promise<IObjectTypeDefinition>
	getAssignedCatalog: (query: object) => ICatalog
	
	// to methods
	toJSONForClient: () => Promise<object>
	
	// add methods
	addAllowedLocale: (locale: ILocale) => Promise<void>
	addCatalog: (catalog: ICatalog) => Promise<void>

	// remove methods
	removeAllowedLocale: (locale: ILocale) => Promise<void>
	removeCatalog: (catalog: ICatalog) => Promise<void>
}