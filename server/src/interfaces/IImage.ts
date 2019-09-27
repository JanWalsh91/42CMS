import { Document } from 'mongoose'

import { IExtensibleObject } from '../interfaces'
import { ILocalizableAttribute } from './ILocalizableAttribute'

export interface IImage extends IExtensibleObject {
	id: string,
	path: string,
	alt: ILocalizableAttribute,
}