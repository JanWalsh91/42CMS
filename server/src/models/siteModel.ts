import { model, Model } from 'mongoose'

import { ISite } from '../interfaces'
import { siteSchema } from '../schemas'

export const Site: Model<ISite> = model('Site', siteSchema)