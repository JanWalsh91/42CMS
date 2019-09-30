import { Document } from 'mongoose'

import { ICatalog, ILocale, IExtensibleObject, IObjectTypeDefinition } from '../interfaces'

export interface ISite extends IExtensibleObject {
	id: string,
	hostName: string,

	allowedLocales: (ILocale['_id'] | ILocale)[]
	defaultLocale: ILocale['_id'] | ILocale
	catalogs: (ICatalog['_id'] | ICatalog)[]
	
	// ==== set ====
	setId: (id: string) => void
	setHostName: (hostName: string) => void

	// ==== get ====
	getObjectTypeDefinition: () => Promise<IObjectTypeDefinition>
	getAssignedCatalog: (query: object) => ICatalog
	
	// ==== to ====
	toJSONForClient: () => Promise<object>
	
	// ==== add ====
	addAllowedLocale: (locale: ILocale) => Promise<void>
	addCatalog: (catalog: ICatalog) => Promise<void>

	// ==== remove ====
	removeAllowedLocale: (locale: ILocale) => Promise<void>
	removeCatalog: (catalog: ICatalog) => Promise<void>
}