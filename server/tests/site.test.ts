import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'
import { clearDataBase, createUser, printret, userData, createCatalog, createSite, getSite, updateSite, deleteSite, updateCatalog, agent, logout  } from './common'
import { User, Category, Catalog, Site } from '../src/models'

import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { ISite, ICatalog } from '../src/interfaces'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes

let ret: any;
const siteId: string = 'siteid'
const hostName: string = 'www.myhostname.com'
const defaultLocaleID: string = 'en'
const catid: string = 'meow'

describe('Site', function() {

	beforeEach(async function() {
		await app.ready
		await clearDataBase()
		await app.ready
		await createUser(userData)
		await app.ready
	})

	describe('Create Site', () => {
		it('Should create a site', async() => {
			ret = await createSite(siteId)
			ret.status.should.eq(OK)

			const site: ISite = await Site.findOne({id: siteId}).exec()
			expect(site.id).eq(siteId)
		})
		describe('Should fail if ... ', () => {
			it('... siteid already used', async() => {
				ret = await createSite(siteId)
				ret = await createSite(siteId)
				ret.status.should.eq(BAD_REQUEST)			
			})
			it('... siteid is invalid', async() => {
				ret = await agent.post(`/sites`).send({id: {siteId}})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... user is not authenticated', async() => {
				await logout()
				ret = await createSite(siteId)
				ret.status.should.eq(UNAUTHORIZED)
			})
		})
	})

	describe('Get Site', () => {
		it('Should get a site with locales and catalogids', async() => {
			ret = await createSite(siteId)
			ret = await updateSite(siteId, {
				defaultLocale: { op: '$set', value: defaultLocaleID},
				allowedLocales: { op: '$add', value: defaultLocaleID},
			})
			ret = await createCatalog(catid)
			ret = await updateCatalog(catid, {
				sites: { op: '$add', value: siteId }
			})

			ret = await getSite(siteId)
			ret.status.should.eq(OK)
			ret.body.id.should.eq(siteId)
			ret.body.defaultLocale.should.eq(defaultLocaleID)
			ret.body.allowedLocales.should.include(defaultLocaleID)
			ret.body.catalogs.should.include(catid)
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

		describe('Should fail if ...', () => {
			it('... locale is not available', async() => {
				ret = await createSite(siteId)
				ret = await updateSite(siteId, {
					allowedLocales: { op: '$add', value: 'fr_FR'}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... locale does not exist', async() => {
				ret = await createSite(siteId)
				ret = await updateSite(siteId, {
					allowedLocales: { op: '$add', value: 'zh'}
				})
				ret.status.should.eq(NOT_FOUND)
			})	
		})
	})

	describe('Delete Site', () => {
		it('Should delete site', async() => {
			ret = await createSite(siteId)
			ret = await createCatalog(catid)
			// Assign catalog to site
			ret = await updateCatalog(catid, { sites: { op: '$add', value: siteId } })

			ret = await deleteSite(siteId)
			ret.status.should.eq(OK)
			
			const site: ISite = await Site.findOne({id: siteId}).exec()
			expect(site).to.not.exist

			const catalog: ICatalog = await Catalog.findOne({id: catid}).populate('sites').exec()
			expect(catalog.sites.find(x => x.id == siteId)).to.not.exist
		})
		describe('Should fail if ...', () => {
			it('... site does not exist', async() => {
				ret = await deleteSite(siteId)
				ret.status.should.eq(NOT_FOUND)
			})
			it('... user is not authorized', async() => {
				ret = await createSite(siteId)
				ret = await createCatalog(catid)
				// Assign catalog to site
				ret = await updateCatalog(catid, { sites: { op: '$add', value: siteId } })
				
				await logout()

				ret = await deleteSite(siteId)
				ret.status.should.eq(UNAUTHORIZED)
			})
		})
	})
})