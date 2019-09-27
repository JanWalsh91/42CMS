import { Document } from 'mongoose'

import { ICatalog } from '../interfaces'

export interface ISite extends Document {
	id: string,
	name: string,
	assignedCatalogs: (ICatalog['_id'] | ICatalog)[]

	getAssignedCatalog: (this: ISite, query: object) => ICatalog,
}