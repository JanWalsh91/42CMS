import { model, Model } from 'mongoose'

import { IGlobalSettings } from '../interfaces' 
import { globalSettingsSchema } from '../schemas'

export const setting: Model<IGlobalSettings> = model<IGlobalSettings>('Setting', globalSettingsSchema);