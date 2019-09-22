import { model, Model } from 'mongoose'

import { IObjectAttributeDefinition } from '../interfaces'
import { objectAttributeDefinitionSchema } from '../schemas'

export const ObjectAttributeDefinition: Model<IObjectAttributeDefinition> = model('ObjectAttributeDefinition', objectAttributeDefinitionSchema)