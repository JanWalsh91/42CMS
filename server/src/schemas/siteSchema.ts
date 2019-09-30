import { Schema } from 'mongoose'
import { ISite, ILocale, ICatalog, IObjectTypeDefinition } from '../interfaces';
import { objectTypeDefinitionService } from '../services';
import { LocalizableAttribute } from '../models';

const siteSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	hostName: {
		type: String,
	},
	allowedLocales: [{
		type: Schema.Types.ObjectId,
		ref: 'Locale',
		default: null,
	}],
	defaultLocale: {
		type: Schema.Types.ObjectId,
		ref: 'Locale',
		default: null,
	},
	catalogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		default: null,
	}],
	custom: {
		type: Map,
		of: {
			type: Schema.Types.ObjectId,
			ref: 'LocalizableAttribute',
			autopopulate: true,
		},
		default: new Map(),
	}
})

siteSchema.methods = {
	
	// ==== set ====

	// ==== get ====
	getObjectTypeDefinition(this: ISite): Promise<IObjectTypeDefinition> {
		return objectTypeDefinitionService.getById('Site')
	},

	// ==== to ====
	async toJSONForClient(this: ISite): Promise<object> {
		await this.populate([
			{path: 'allowedLocales'},
			{path: 'defaultLocale'},
			{path: 'catalogs'},
		]).execPopulate()
		
		return {
			id: this.id,
			hostName: this.hostName,
			allowedLocales: this.allowedLocales ? this.allowedLocales.map((locale: ILocale) => locale.id) : null,
			defaultLocale: this.defaultLocale ? this.defaultLocale.id : null,	
			catalogs: this.catalogs ? this.catalogs.map((catalog: ICatalog) => catalog.id) : null,
		}
	},

	// ==== add ==== 
	async addAllowedLocale(this: ISite, locale: ILocale): Promise<void> {
		await this.populate('allowedLocales').execPopulate()
		
		if (!this.allowedLocales.some((x: ILocale) => x.id == locale.id)) {
			this.allowedLocales.push(locale)
			this.markModified('allowedLocales')
		}
	},
	async addCatalog(this: ISite, catalog: ICatalog): Promise<void> {
		await this.populate('catalog').execPopulate()
		
		if (!this.catalogs.some((x: ICatalog) => x.id == catalog.id)) {
			this.catalogs.push(catalog)
			this.markModified('catalogs')
		}
	},

	// ==== remove ====
	async removeAllowedLocale(this: ISite, locale: ILocale): Promise<void> {
		await this.populate('allowedLocales').execPopulate()
		
		if (this.allowedLocales.some((x: ILocale) => x.id == locale.id)) {
			this.allowedLocales = this.allowedLocales.filter((x: ILocale) => x.id != locale.id) 
			this.markModified('allowedLocales')
		}
	},
	async removeCatalog(this: ISite, catalog: ICatalog): Promise<void> {
		await this.populate('catalogs').execPopulate()
		
		if (this.catalogs.some((x: ICatalog) => x.id == catalog.id)) {
			this.catalogs = this.catalogs.filter((x: ICatalog) => x.id != catalog.id) 
			this.markModified('catalogs')
		}
	},
}

siteSchema.plugin(require('mongoose-autopopulate'))

siteSchema.pre('save', async function(this: ISite) {
	if (this.isNew) {
		console.log('pre save site')
		await objectTypeDefinitionService.initExtensibleObject(this)
	}
})

siteSchema.pre('find', <any>async function(sites: ISite[]) {
	for (let site of sites) {
		await site.populate('custom').execPopulate()
	}
})

siteSchema.pre('findOne', function(this: ISite) {
	this.populate('custom')
})

export {
	siteSchema
}