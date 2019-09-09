import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import app from '../src/app'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct  } from './common';
import { ObjectTypeDefinition } from '../src/models'

let ret: any;

describe('Object Type Definitions', () => {
	before(async () => {
		await app.ready
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})

	beforeEach(async function() {
		await clearDataBase(ObjectTypeDefinition)
	})

	describe('Get', () => {
		it('Should get Product attribute definition', async() => {
			
		})
	})

})