import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, updateObjectAttributeDefinition, updateObjectTypeDefinition, createSite, getSite, updateSite, deleteSite  } from './common'
import { User, Category, Catalog, Product, ObjectTypeDefinition, Site } from '../src/models'

import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { ISite } from '../src/interfaces'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes

let ret: any;
const siteId: string = 'siteid'
const hostName: string = 'www.myhostname.com'
const defaultLocaleID: string = 'en'
const localeId: string = 'fr'

describe('Site', function() {
	before(async () => {
		// wait for server to init async tasks
		await app.ready
		// Clear database
		await clearDataBase()
		// Create user
		await createUser(userData)
		await app.ready
	})

	beforeEach(async function() {
		await clearDataBase(Site, Catalog, Category)
		await app.ready
	})

	describe('Create Site', () => {
		it('Should create a site', async() => {
			ret = await createSite(siteId)
			ret.status.should.eq(OK)

			const site: ISite = await Site.findOne({id: siteId}).exec()
			expect(site.id).eq(siteId)
		})
	})

	describe('Get Site', () => {
		// TODO: assign catalog to site 
		it('Should get a site with locales and catalogids', async() => {
			ret = await createSite(siteId)
			// TODO: add locale
			// TODO: add default lcoale
			// TODO: add assigned Catalogs
			
			ret = await getSite(siteId)
			ret.status.should.eq(OK)
			ret.body.id.should.eq(siteId)
		})
	})

	describe('Update Site', () => {
		it('Should set hostname', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				hostName: { op: '$set', value: hostName}
			})
			ret.status.should.eq(OK)

			const site: ISite = await Site.findOne({id: siteId}).exec()
			site.hostName.should.eq(hostName)
		})
		it('Should set default locale', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				defaultLocale: { op: '$set', value: defaultLocaleID}
			})
			ret.status.should.eq(OK)

			const site: ISite = await Site.findOne({id: siteId}).populate([{path: 'allowedLocales'}, {path: 'defaultLocale'}]).exec()
			site.allowedLocales.find(x => x.id == defaultLocaleID).should.exist
			site.defaultLocale.id.should.eq(defaultLocaleID)
		})
		it('Should add allowed locale', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				allowedLocales: { op: '$add', value: defaultLocaleID}
			})
			ret.status.should.eq(OK)

			const site: ISite = await Site.findOne({id: siteId}).populate([{path: 'allowedLocales'}]).exec()
			site.allowedLocales.find(x => x.id == defaultLocaleID).should.exist
		})
		it('Should remove allowed locale', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				allowedLocales: { op: '$add', value: defaultLocaleID}
			})
			ret.status.should.eq(OK)
			ret = await updateSite(siteId, {
				allowedLocales: { op: '$remove', value: defaultLocaleID}
			})

			const site: ISite = await Site.findOne({id: siteId}).populate([{path: 'allowedLocales'}]).exec()
			expect(site.allowedLocales.find(x => x.id == defaultLocaleID)).to.not.exist
		})
	})

	describe('Delete Site', () => {
		it('Should delete site', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				hostName: { op: '$set', value: hostName}
			})

			ret = await deleteSite(siteId)
			ret.status.should.eq(OK)
			const site: ISite = await Site.findOne({id: siteId}).exec()
			expect(site).to.not.exist

			// TODO: check catalog assignments
		})
	})
})