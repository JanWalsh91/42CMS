import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, getObjectTypeDefinition, updateObjectTypeDefinition, updateObjectAttributeDefinition  } from './common';
import { ObjectTypeDefinition } from '../src/models'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { IObjectAttributeDefinition } from '../src/interfaces';

const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;

describe('Object Type Definitions', () => {
	before(async () => {
		await app.ready
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})

	beforeEach(async () => {
		await clearDataBase(ObjectTypeDefinition)
		await app.ready
	})

	describe('Get', () => {
		it('Should get Product attribute definition', async() => {
			ret = await getObjectTypeDefinition('Product')
			ret.status.should.eq(OK)
		})
	})

	describe('Create custom attribute definition', () => {
		it('Should create a custom attribute', async() => {
			const path: string = 'test'
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
			})
			ret.status.should.eq(OK)
			ret = await getObjectTypeDefinition('Product')
			expect(ret.body.objectAttributeDefinitions.find(x => x.path == path)).to.exist
		})
		describe('Should fail if ...', () => {
			it('... path already exists', async() => {
				const path: string = 'test'
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
				})
				ret.status.should.eq(OK)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
		})
	})

	describe('Update custom attribute definition', () => {
		it('Should update attribute definition type', async() => {
			const path: string = 'test'
			const newType: string = 'number'
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
			})
			ret = await updateObjectAttributeDefinition('Product', path, {
				type: { op: '$set', value: newType }
			})
			ret.status.should.eq(OK)
			ret = await getObjectTypeDefinition('Product')
			const OAD: IObjectAttributeDefinition = ret.body.objectAttributeDefinitions.find(x => x.path == path)
			OAD.type.should.eq(newType)
		})
		it('Should update attribute definition localizable', async () => {
			const path: string = 'test'
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
			})
			ret = await updateObjectAttributeDefinition('Product', path, {
				localizable: { op: '$set', value: false }
			})
			ret.status.should.eq(OK)
			ret = await getObjectTypeDefinition('Product')
			const OAD: IObjectAttributeDefinition = ret.body.objectAttributeDefinitions.find(x => x.path == path)
			OAD.localizable.should.eq(false)
		})
	})

	describe('Delete custom attribute definition', () => {
		it('Should delete custom attribute definition', async() => {
			const path: string = 'test'
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: { op: '$add', path: path, type: 'string', localizable: true }
			})
			ret.status.should.eq(OK)
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: { op: '$remove', path: path }
			})
			ret.status.should.eq(OK)
			ret = await getObjectTypeDefinition('Product')
			expect(ret.body.objectAttributeDefinitions.find(x => x.path == path)).to.not.exist
		})
	})
})