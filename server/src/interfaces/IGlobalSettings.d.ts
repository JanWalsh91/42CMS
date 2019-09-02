import { Document } from 'mongoose'

import { IExtensibleObject, ILocaleSettings } from '.'

export interface IGlobalSettings extends Document {
	locale: ILocaleSettings,
}