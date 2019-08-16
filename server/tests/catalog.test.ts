import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, logout, createCategory, categoryData, deleteCatalog } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

import { Catalog } from '../src/models/catalogModel';

let ret: any

const catalogData = {
	id: 'storefrontCatalog',
	isMaster: true
}

describe.only('Catalog', () => {
	beforeEach(async() => {
		await clearDataBase()
		await createUser(userData)
	})

	describe('Create', () => {
		it('Should create a catalog', async() => {
			console.log(chalk.blue('Should create a catalog'))
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
			// Catalog should be added to database
			const catalog = await Catalog.findOne({id: catalogData.id})
			console.log({catalog})
			catalog.should.exist
			// Catalog should have a root category which exists in the database
			catalog.rootCategory.should.exist
			// note: 'root' category itself is not in categories
		})
		it('Should create two catalogs', async () => {
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await createCatalog(catalogData.id + '2')
			ret.should.have.status(OK)
		})
		it('Should create a master catalog', async () => {
			ret = await createCatalog(catalogData.id, {isMaster: true})
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
			await Promise.all(['matser', 'china', 'international'].map(id => createCatalog(id)))
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

	describe.skip('Delete Catalog', () => {
		it('Should delete catalog', async() => {
			const catid1 = 'category1'
			const catid2 = 'category2'
			await createCatalog(catalogData.id)
			await createCategory(catalogData.id, catid1)
			await createCategory(catalogData.id, catid2, {parent: catid1})
			console.log('delete request ', catalogData.id)
			ret = await deleteCatalog(catalogData.id)
			printret(ret)
			ret.status.should.eq(OK)
			expect(await Catalog.findOne({id: catalogData.id})).to.not.exist
			expect(await Catalog.find({id: { $or: [catid1, catid2] }})).length.eq(0)
		})
	})
});