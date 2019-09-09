import { model, Model } from 'mongoose'

import { IObjectTypeDefinition } from '../interfaces'
import { objectTypeDefinitionSchema } from '../schemas'

export const ObjectTypeDefinition: Model<IObjectTypeDefinition> = model('ObjectTypeDefinition', objectTypeDefinitionSchema)
