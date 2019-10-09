import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, logout, createCategory, deleteCatalog, updateCatalog, createSite, agent, createProduct, updateProduct } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

import { Catalog, Category, Site, Product } from '../src/models'
import { ICatalog, ISite } from '../src/interfaces'
import app from '../src/app'

let ret: any

const catalogData = {
	id: 'storefrontCatalog',
	master: true
}
const siteId: string = 'siteid'

describe('Catalog', () => {
	before(async () => {
		await app.ready
	})

	beforeEach(async() => {
		await clearDataBase()
		await createUser(userData)
		await app.ready
	})

	describe('Create', () => {
		it('Should create a catalog', async() => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
			// Catalog should be added to database
			const catalog = await Catalog.findOne({ id: catalogData.id })
			catalog.should.exist
			// Catalog should have a root category which exists in the database
			catalog.rootCategory.should.exist
			catalog.master.should.eq(false)
		})
		it('Should create a master catalog', async() => {
			ret = await createCatalog(catalogData.id, { master: true })
			ret.should.have.status(OK)
			// Catalog.master should be true
			const catalog = await Catalog.findOne({ id: catalogData.id })
			catalog.master.should.eq(true)
		})
		it('Should create two catalogs', async () => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await createCatalog(catalogData.id + '2')
			ret.should.have.status(OK)
		})
		it('Should create a catalog with name', async () => {
			const name: string = 'catname'
			ret = await createCatalog(catalogData.id, { master: true, name })
			ret.should.have.status(OK)
			// Chekc catalog.name
			const catalog = await Catalog.findOne({ id: catalogData.id })
			catalog.name.should.eq(name)
		})
		describe('Should fail to create a catalog if ...', () => {
			it('Catalog name already exists', async() => {
				ret = await createCatalog(catalogData.id)
				ret.should.have.status(OK)
				ret = await createCatalog(catalogData.id)
				ret.should.have.status(BAD_REQUEST)
			})
			it('ID not provided', async() => {
				ret = await agent.post(`/catalogs/`).send()
				ret.should.have.status(BAD_REQUEST)
			})
			it('ID in invalid', async() => {
				ret = await agent.post(`/catalogs/`).send({id: {test: 'myobject'}})
				ret.should.have.status(BAD_REQUEST)
			})
			it('master in invalid', async() => {
				ret = await agent.post(`/catalogs/`).send({master: {test: 'myobject'}})
				ret.should.have.status(BAD_REQUEST)
			})
			it('User is not authenticated', async() => {
				await logout()
				ret = await createCatalog(catalogData.id)
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})
	
	describe('Get Catalog', () => {
		it('Should get a catalog', async() => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await getCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
		})
		describe('Should fail if ...', () => {
			it('Catalog does not exist', async () => {
				ret = await getCatalog(catalogData.id)
				ret.should.have.status(NOT_FOUND)				
			})
			it('User is not authenticated', async() => {
				await logout()
				ret = await getCatalog(catalogData.id)
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})

	describe('Get all Catalogs', () => {
		it('Should get all Catalogs', async() => {
			await createCatalog('fr')
			await createCatalog('china')
			await createCatalog('international')
			// await Promise.all(['fr', 'china', 'international'].map(id => createCatalog(id)))
			ret = await getAllCatalogs()
			ret.body.length.should.equal(3)
			ret.should.have.status(OK)
		})
		describe('Should fail if ...', () => {
			it('User is not authenticated', async() => {
				await logout()
				ret = await getAllCatalogs()
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})

	describe('Delete Catalog', () => {
		const catalogid2 = 'catalogid2'
		const catid1 = 'category1'
		const catid2 = 'category2'
		const catid3 = 'category3'
		const siteid1 = 'site1'
		const siteid2 = 'site2'
		const productid1 = 'product1'
		const productid2 = 'product2'

		it('Should delete catalog', async() => {

			await createCatalog(catalogData.id)
			// Add category
			await createCategory(catalogData.id, catid1)
			// Add two categories as subcats
			await createCategory(catalogData.id, catid2, { parent: catid1 })
			await createCategory(catalogData.id, catid3, { parent: catid1 })
			// Assign catalog to two sites
			await createSite(siteid1)
			await createSite(siteid2)
			await updateCatalog(catalogData.id, {
				sites: [
					{ op: '$add', value: siteid1 },
					{ op: '$add', value: siteid2 },
				]
			})
			// Add products to a master catalog and assign to test catalog
			await createCatalog(catalogid2, { master: true })
			await createProduct(catalogid2, productid1)
			await createProduct(catalogid2, productid2)
			await updateProduct(productid1, {
				assignedCatalogs: { op: '$add', value: catalogData.id }
			})
			await updateProduct(productid2, {
				assignedCatalogs: { op: '$add', value: catalogData.id }
			})

			ret = await deleteCatalog(catalogData.id)
			ret.status.should.eq(OK)
			
			// Catalog should no longer exist
			expect(await Catalog.findOne({id: catalogData.id})).to.not.exist

			// Catalog's categories should no longer exist
			expect(await Category.find({id: { $in: [catid1, catid2, catid3] }})).length(0)

			// Products should still exist
			expect(await Product.find({id: { $in: [productid1, productid2] } })).length(2)

			// Sites should not longer have catalog assignments
			const sites: ISite[] = await Site.find({id: { $in: [siteid1, siteid2] } })
			sites.forEach((site: ISite) => {
				site.catalogs.length.should.eq(0)
			})
		})

		it('Should delete products from a non master catalog which is deleted', async() => {
			await createCatalog(catalogData.id, { master: true })
			// Add product to master catalog
			await createProduct(catalogData.id, productid1)
			await createProduct(catalogData.id, productid2)

			ret = await deleteCatalog(catalogData.id)
			ret.status.should.eq(OK)
			
			// Products should no longer exist
			expect(await Product.find({id: { $in: [productid1, productid2] } })).length(0)
		})

		describe('Should fail if ...', () => {
			it('Catalog does not exist', async() => {
				await createCatalog(catalogData.id)
				ret = await deleteCatalog(catalogData.id + '2')
				ret.should.have.status(NOT_FOUND)
			})
			it('User is not authenticated', async() => {
				await createCatalog(catalogData.id)
				await logout()
				ret = await deleteCatalog(catalogData.id)
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})

	describe('Update Catalog', () => {
		const newName: string = 'newName'
		const newId: string = 'newID'

		it('Should update id', async() => {
			await createCatalog(catalogData.id)
			ret = await updateCatalog(catalogData.id, {
				id: { op: '$set', value: newId }
			})
			ret.status.should.eq(OK)

			// Catalog's name should be updated
			const catalog: ICatalog = await Catalog.findOne({id: newId})
			catalog.id.should.eq(newId)
		})
		it('Should update name and id', async() => {
			await createCatalog(catalogData.id)
			ret = await updateCatalog(catalogData.id, {
				id: { op: '$set', value: newId },
				name: { op: '$set', value: newName },
			})
			ret.status.should.eq(OK)
			
			// Catalog's name and id should be updated
			const catalog: ICatalog = await Catalog.findOne({id: newId})
			catalog.name.should.eq(newName)
			catalog.id.should.eq(newId)
		})
		it('Should assign a catalog to a site', async() => {
			ret = await createCatalog(catalogData.id)
			ret = await createSite(siteId)
			ret = await updateCatalog(catalogData.id, {
				sites: { op: '$add', value: siteId }
			})
			ret.status.should.eq(OK)

			// Site should have catalog
			const site: ISite = await Site.findOne({id: siteId}).populate('catalogs').exec()
			expect(site.catalogs.find(x => x.id == catalogData.id)).to.exist

			// Catalog should have site
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('sites').exec()
			expect(catalog.sites.find(x => x.id == siteId)).to.exist
		})
		it('Should unassigned a catalog from a site', async() => {
			ret = await createCatalog(catalogData.id)
			ret = await createSite(siteId)
			ret = await updateCatalog(catalogData.id, {
				sites: { op: '$add', value: siteId }
			})
			ret = await updateCatalog(catalogData.id, {
				sites: { op: '$remove', value: siteId }
			})
			ret.status.should.eq(OK)

			// Site should not have catalog
			const site: ISite = await Site.findOne({id: siteId}).populate('catalogs').exec()
			expect(site.catalogs.find(x => x.id == catalogData.id)).to.not.exist

			// Catalog should not have site
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('sites').exec()
			expect(catalog.sites.find(x => x.id == siteId)).to.not.exist
		})

		describe('Should fail if ...', () => {
			it('User is not authorized', async() => {
				await createCatalog(catalogData.id)
				await logout()
				ret = await updateCatalog(catalogData.id, {
					id: { op: '$set', value: newId }
				})
				ret.status.should.eq(UNAUTHORIZED)

				// Catalog's name should not be updated
				const catalog: ICatalog = await Catalog.findOne({id: newId})
				expect(catalog).to.not.exist
			})
			it('Name is invalid', async() => {
				const name: string = 'catname'
				await createCatalog(catalogData.id, { name })
				ret = await updateCatalog(catalogData.id, {
					name: { op: '$set', value: ['newNameInArray'] }
				})
				ret.status.should.eq(BAD_REQUEST)

				// Catalog's id should not be updated
				const catalog: ICatalog = await Catalog.findOne({id: catalogData.id})
				catalog.name.should.eq(name)
			})
			it('Id is not unique', async() => {
				await createCatalog(catalogData.id)
				await createCatalog(catalogData.id + '2')
				ret = await updateCatalog(catalogData.id, {
					id: { op: '$set', value: catalogData.id + '2' }
				})
				printret(ret)
				ret.status.should.eq(BAD_REQUEST)				

				// Catalog's id should not bd updated
				const catalog: ICatalog = await Catalog.findOne({id: catalogData.id + '2'})
				expect(catalog).to.exist
			})
			it('Site does not exist', async() => {
				ret = await createCatalog(catalogData.id)
				ret = await updateCatalog(catalogData.id, {
					sites: { op: '$add', value: siteId }
				})
				ret.status.should.eq(NOT_FOUND)

				// Catalog not should have site
				const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('sites').exec()
				expect(catalog.sites.find(x => x.id == siteId)).to.not.exist
			})
		})
	})
});