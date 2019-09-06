import { model, Model } from 'mongoose'

import { ILocale } from '../interfaces'
import { localeSchema } from '../schemas'

export const Locale: Model<ILocale> = model('Locale', localeSchema)