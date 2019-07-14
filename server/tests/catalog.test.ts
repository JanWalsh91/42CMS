import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes 

import { User } from '../src/models/userModel'
import { Project } from '../src/models/projectModel'
import { Catalog } from '../src/models/catalogModel'

let ret: any

const catalogData = {
	id: 'storefrontCatalog'
}

describe('Catalog', () => {
	let project: any = {};

	beforeEach(async() => {
		console.log('[Project] beforeEach')
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
		project = ret.body.project
	})

	describe('Create', () => {
		it.only('Should create a catalog', async() => {
			console.log(chalk.blue('Should create a catalog'))
			// Should return OK
			ret = await createCatalog({projectId: project.id, ...catalogData})
			ret.should.have.status(OK)
			// Catalog should exist
			const catalog = await Catalog.findOne({id: catalogData.id})
			catalog.should.exist
		})
		describe('Should fail to create a catalog if ...', () => {
			it('TODO');
		})
	});
	
	describe('GetAll', () => {
		it('Should get all categories of a project')
	});

	describe('Get', () => {
		it('Should get a cateogry')
	});
});