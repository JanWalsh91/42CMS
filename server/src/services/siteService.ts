import chalk from 'chalk'

import { Patchable, patchAction, ValidationError, ResourceNotFoundError, patchRequest } from '../utils'
import { ISite, ILocale, ICatalog } from '../interfaces'
import { objectTypeDefinitionService, localeService, catalogService } from '.'
import { Site } from '../models'

class SiteService extends Patchable<ISite> {
	hasObjectTypeDefinition = true
	protected async getObjectTypeDefinition() {
		return objectTypeDefinitionService.getById('Site')
	}

	patchMap = {
		id: {
			$set: async(product: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setId(product, action.value)
			},
		},
		hostName: {
			$set: async(product: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setHostname(product, action.value)
			},
		},
		defaultLocale: {
			$set: async(product: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setDefaultLocale(product, action.value)
			},
		},
		allowedLocales: {
			$add: async(product: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.addAllowedLocale(product, action.value)
			},
			$remove: async(product: ISite, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.removeAllowedLocale(product, action.value)
			},
		},
	}

	public async create(id: string): Promise<ISite> {
		console.log(chalk.blue('[siteService.create]'), id)

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
		console.log(chalk.magenta(`[SiteService.update]`), site)

		await this.patch(site, patchRequest, resources)
		return site.save()
	}

	private async setId(site: ISite, id: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.setId] ${id}`))
		site.id = id
		return site
	}

	private async setHostname(site: ISite, hostName: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.setHostname] ${hostName}`))
		site.hostName = hostName
		return site
	}

	private async setDefaultLocale(site: ISite, localeId: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.setDefaultLocale] ${localeId}`))
		const locale: ILocale = await localeService.getById(localeId)

		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}

		await this.addAllowedLocale(site, localeId)

		site.defaultLocale = locale
		await site.save()
		return site
	}

	private async addAllowedLocale(site: ISite, localeId: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.addAllowedLocale] ${localeId}`))

		const locale: ILocale = await localeService.getById(localeId)
		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}

		await site.addAllowedLocale(locale)
		await site.save()
		return site
	}

	private async removeAllowedLocale(site: ISite, localeId: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.addAllowedLocale] ${localeId}`))

		const locale: ILocale = await localeService.getById(localeId)
		if (!locale) {
			throw new ResourceNotFoundError('Locale', localeId)
		}

		await site.removeAllowedLocale(locale)
		await site.save()
		return site
	}

	public async getById(id: string): Promise<ISite> {
		console.log(chalk.magenta(`[SiteService.getById] ${id}`))
		return Site.findOne({id}).exec()
	}

	public async delete(site: ISite): Promise<void> {
		console.log(chalk.magenta('[siteService.delete] ' +  site.id))
		
		await site.populate('catalogs').execPopulate()
		
		// Unassign catalogs from site
		await site.catalogs.reduce(async (_, catalog: ICatalog) => _.then(() => catalogService.removeSite(catalog, site.id)), Promise.resolve())

		await site.remove()
	}
}

export const siteService: SiteService = new SiteService()