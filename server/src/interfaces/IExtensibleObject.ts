import { Document } from 'mongoose'

import { ILocalizableAttribute } from '.'

export interface IExtensibleObject extends Document {
	custom: Map<string, ILocalizableAttribute>
}