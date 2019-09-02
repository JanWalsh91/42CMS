import { model, Model } from 'mongoose'

import { ICatalog } from '../interfaces'
import { catalogSchema } from '../schemas'

export const Catalog: Model<ICatalog> = model('Catalog', catalogSchema)