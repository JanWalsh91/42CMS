import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes 

import { Project } from '../src/models/projectModel';

let ret: any

const catalogData = {
	id: 'storefrontCatalog'
}

describe('Catalog', () => {
	let project: any = {};

	beforeEach(async() => {
		console.log('[Catalog] beforeEach')
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
		project = ret.body.project
	})

	describe('Create', () => {
		it('Should create a catalog', async() => {
			console.log(chalk.blue('Should create a catalog'))
			// Should return OK
			ret = await createCatalog(project.id, catalogData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(catalogData.id)
			// Catalog should exist
			project = await Project.findOne({id: project.id})
			project.catalogs.should.have.length(1)
			project.catalogs[0].id.should.equal(catalogData.id)
			// const catalog = await Catalog.findOne({id: catalogData.id})
			// catalog.should.exist
		})
		describe('Should fail to create a catalog if ...', () => {
			console.log(chalk.blue('Should fail to create a catalog if ...'))
			it('Catalog with id already exists in project', async() => {
				console.log(chalk.blue('Catalog with id already exists in project'))
				ret = await createCatalog(project.id, catalogData.id)
				ret.should.have.status(OK)
				ret = await createCatalog(project.id, catalogData.id)
				ret.should.have.status(BAD_REQUEST)
			})
		})
	})
	
	describe('Get', () => {
		it('Should get a catalog', async() => {
			console.log(chalk.blue('Should get a catalog'))
			ret = await createCatalog(project.id, catalogData.id)
			ret.should.have.status(OK)
			ret = await getCatalog(project.id, catalogData.id)
			ret.body.id.should.equal(catalogData.id)
			ret.should.have.status(OK)
		})
	})

	describe('GetAll', () => {
		it('Should get all categories of a project', async() => {
			console.log(chalk.blue('Should get all categories of a project'))
			await Promise.all(['matser', 'china', 'international'].map(id => createCatalog(project.id, id)))
			ret = await getAllCatalogs(project.id)
			printret(ret)
			ret.body.catalogs.length.should.equal(3)
			ret.should.have.status(OK)
		})
	})

});