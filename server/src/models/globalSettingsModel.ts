import { model, Model } from 'mongoose'

import { IGlobalSettings } from '../interfaces' 
import { globalSettingsSchema } from '../schemas'

export const GlobalSettings: Model<IGlobalSettings> = model<IGlobalSettings>('GlobalSettings', globalSettingsSchema)