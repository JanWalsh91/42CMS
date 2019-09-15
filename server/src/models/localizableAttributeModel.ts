import { model, Model } from 'mongoose'

import { ILocalizableAttribute } from '../interfaces'
import { localizableAttributeSchema } from '../schemas'

export const LocalizableAttribute: Model<ILocalizableAttribute> = model('LocalizableAttribute', localizableAttributeSchema)