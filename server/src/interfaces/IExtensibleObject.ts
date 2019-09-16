import { Document } from 'mongoose'

export interface IExtensibleObject extends Document {
	custom: Record<string, any>
}