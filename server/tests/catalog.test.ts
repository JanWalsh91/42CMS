import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes 

import { Catalog } from '../src/models/catalogModel';

let ret: any

const catalogData = {
	id: 'storefrontCatalog',
	isMaster: true
}

describe('Catalog', () => {
	beforeEach(async() => {
		// console.log('[Catalog] beforeEach')
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})

	describe('Create', () => {
		it('Should create a catalog', async() => {
			console.log(chalk.blue('Should create a catalog'))
			// Should return OK
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			printret(ret)
			ret.body.id.should.equal(catalogData.id)
			// Catalog should be added to database
			const catalog = await Catalog.findOne({id: catalogData.id})
			console.log({catalog})
			catalog.should.exist
			// Catalog should have a root category which exists in the databse
			catalog.rootCategory.should.exist
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
		// describe('Should fail to create a catalog if ...', () => {
		// 	console.log(chalk.blue('Should fail to create a catalog if ...'))
		// })
	})
	
	describe('Get', () => {
		it('Should get a catalog', async() => {
			console.log(chalk.blue('Should get a catalog'))
			ret = await createCatalog(catalogData.id)
			ret.should.have.status(OK)
			ret = await getCatalog(catalogData.id)
			printret(ret)
			ret.body.id.should.equal(catalogData.id)
			ret.should.have.status(OK)
		})
	})

	describe('GetAll', () => {
		it('Should get all categories of a project', async() => {
			console.log(chalk.blue('Should get all categories of a project'))
			await Promise.all(['matser', 'china', 'international'].map(id => createCatalog(id)))
			ret = await getAllCatalogs()
			printret(ret)
			ret.body.catalogs.length.should.equal(3)
			ret.should.have.status(OK)
		})
	})

});