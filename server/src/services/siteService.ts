import { Patchable, patchAction, ValidationError, ResourceNotFoundError, patchRequest } from '../utils'
import { ISite, ILocale, ICatalog, IGlobalSettings } from '../interfaces'
import { objectTypeDefinitionService, localeService, catalogService, globalSettingsService } from '.'
import { Site } from '../models'

class SiteService extends Patchable<ISite> {
	hasObjectTypeDefinition = true
	protected async getObjectTypeDefinition() {
		return objectTypeDefinitionService.getById('Site')
	}

	patchMap = {
		id: {
			$set: async(site: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await site.setId(action.value)
			},
		},
		hostName: {
			$set: async(site: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await site.setHostName(action.value)
			},
		},
		defaultLocale: {
			$set: async(site: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setDefaultLocale(site, action.value)
			},
		},
		allowedLocales: {
			$add: async(site: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.addAllowedLocale(site, action.value)
			},
			$remove: async(site: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.removeAllowedLocale(site, action.value)
			},
		},
	}

	public async create(id: string): Promise<ISite> {
		const existingSite: ISite = await this.getById(id)
		if (existingSite) {
			throw new ValidationError('Site already exists')
		}

		const site: ISite = await new Site({
			id
		}).save()
		return site;
	}

	public async update(site: ISite, patchRequest: patchRequest, resources: any): Promise<ISite> {
		await this.patch(site, patchRequest, resources)
		return site.save()
	}

	private async setDefaultLocale(site: ISite, localeId: string): Promise<ISite> {
		const locale: ILocale = await localeService.getById(localeId)
		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}
	
		await site.setDefaultLocale(locale)
		await site.save()
		return site
	}

	private async addAllowedLocale(site: ISite, localeId: string): Promise<ISite> {
		const locale: ILocale = await localeService.getById(localeId)
		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}
		const globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(localeId)) {
			throw new ValidationError(`Locale [${localeId}] is not available`)
		}
		await site.addAllowedLocale(locale)
		await site.save()
		return site
	}

	private async removeAllowedLocale(site: ISite, localeId: string): Promise<ISite> {
		const locale: ILocale = await localeService.getById(localeId)
		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}

		await site.removeAllowedLocale(locale)
		await site.save()
		return site
	}

	public async getById(id: string): Promise<ISite> {
		return Site.findOne({id}).exec()
	}

	public async delete(site: ISite): Promise<void> {
		await site.populate('catalogs').execPopulate()
		
		// Unassign catalogs from site
		await site.catalogs.reduce(async (_, catalog: ICatalog) => _.then(() => catalogService.removeSite(catalog, site.id)), Promise.resolve())

		await site.remove()
	}
}

export const siteService: SiteService = new SiteService()