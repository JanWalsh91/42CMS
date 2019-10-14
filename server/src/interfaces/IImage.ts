import { IExtensibleObject } from '../interfaces'
import { ILocalizableAttribute } from './ILocalizableAttribute'

export interface IImage extends IExtensibleObject {
	id: string
	path: string
	alt: ILocalizableAttribute

	// ==== set ====
	setId: (this: IImage, id: string) => void
}