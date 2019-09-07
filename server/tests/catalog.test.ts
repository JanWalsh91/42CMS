import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, logout, createCategory, categoryData, deleteCatalog, updateCatalog } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

import { Catalog, Category } from '../src/models'
import { ICatalog } from '../src/interfaces'
import app from '../src/app'

let ret: any

const catalogData = {
	id: 'storefrontCatalog',
	master: true
}

describe('Catalog', () => {
	before(async () => {
		await app.ready
	})

	beforeEach(async() => {
		await clearDataBase()
		await createUser(userData)
	})

	describe('Create', () => {
		it('Should create a catalog', async() => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
			// Catalog should be added to database
			const catalog = await Catalog.findOne({id: catalogData.id})
			catalog.should.exist
			// Catalog should have a root category which exists in the database
			catalog.rootCategory.should.exist
			catalog.master.should.eq(false)
		})
		it('Should create a master catalog', async() => {
			ret = await createCatalog(catalogData.id, { master: true })
			ret.should.have.status(OK)
			// Catalog.master should be true
			const catalog = await Catalog.findOne({id: catalogData.id})
			catalog.master.should.eq(true)
		})
		it('Should create two catalogs', async () => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await createCatalog(catalogData.id + '2')
			ret.should.have.status(OK)
		})
		it('Should create a master catalog', async () => {
			ret = await createCatalog(catalogData.id, {master: true})
			ret.should.have.status(OK)
		})
		describe('Should fail to create a catalog if ...', () => {
			it('Catalog already exists', async() => {
				ret = await createCatalog(catalogData.id)
				ret.should.have.status(OK)
				ret = await createCatalog(catalogData.id)
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
			console.log(chalk.blue('Should get a catalog: '), catalogData)
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await getCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
		})
		describe('Should fail if ...', () => {
			it('Catalog does not exist', async () => {
				console.log(chalk.blue('Should fail if catalog does not exist'))
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
		it('Should delete catalog', async() => {
			const catid1 = 'category1'
			const catid2 = 'category2'
			const catid3 = 'category3'

			await createCatalog(catalogData.id)
			await createCategory(catalogData.id, catid1)
			// Add two categories as subcats
			await createCategory(catalogData.id, catid2, {parent: catid1})
			await createCategory(catalogData.id, catid3, {parent: catid1})
			
			ret = await deleteCatalog(catalogData.id)
			printret(ret)
			ret.status.should.eq(OK)
			
			// Catalog should no longer exist
			expect(await Catalog.findOne({id: catalogData.id})).to.not.exist

			// Catalog's categories should no longer exist
			expect(await Category.find({id: { $in: [catid1, catid2, catid3] }})).length(0)

			// TODO: products should no longer be assigned to that Catalog
		})
	})

	describe('Update Catalog', () => {
		const newName: string = 'newName'
		const newId: string = 'newID'

		it('Should update is', async() => {
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
		describe('Should fail if ...', () => {
			it('User is not authorized')
			it('Name is invalid')
			it('Id is not unique')
		})
	})
});