import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct  } from './common';

import { User, Category, Catalog, Product, IProduct, ICatalog } from '../src/models'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

describe.only('Product', function() {

	before(async function() {
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})

	beforeEach(async function() {
		await clearDataBase(Category, Catalog, Product)
		// Create catalog
		ret = await createCatalog(catalogData.id, {master: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(catalogData.id, categoryData.id)
		category = ret.body
	})

	describe('Create', () => {
		it('Should create a product', async() => {
			ret = await createProduct(catalogData.id, productData.id, { name: productData.name })
			ret.status.should.equal(OK)

			// Product should exist
			const product: IProduct = await Product.findOne({id: productData.id}).populate('masterCatalog').exec()
			product.masterCatalog.id.should.eq(catalogData.id)
	
			// Master Catalog should have product
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('products').exec()
			catalog.products.find(x => x.id == productData.id).should.exist
		})
	})

	describe('Get Product', () => {
		it('Should get a product', async() => {
			ret = await createProduct(catalogData.id, productData.id, {name: productData.name})
			ret.should.have.status(OK)
			ret = await getProduct(productData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(productData.id)
		})
		describe('Should fail if ...', () => {
			it('Product does not exist', async () => {
				ret = await getProduct(productData.id)
				ret.should.have.status(NOT_FOUND)				
			})
			it('User is not authenticated', async() => {
				await logout()
				ret = await getProduct(productData.id)
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
		})
	})

	describe('Get all Products', () => {
		it('Should get all Products', async() => {
			await Promise.all([1, 2, 3].map(id => createProduct(catalogData.id, `id${id}`, { name: `name${id}`})))
			ret = await getAllProducts()
			ret.body.length.should.equal(3)
			ret.should.have.status(OK)
		})
		describe('Should fail if ...', () => {
			it('User is not authenticated', async() => {
				await logout()
				ret = await getAllProducts()
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
		})
	})

	describe('Delete product', () => {
		it('Should delete the product', async() => {
			await createProduct(catalogData.id, productData.id, {name: productData.name})
			ret = await deleteProduct(productData.id)
			ret.should.have.status(OK)

			// Product should not exist
			const product: IProduct = await Product.findOne({id: productData.id})
			expect(product).to.not.exist
			
			// Catalog should not have product
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('products')
			catalog.products.should.have.length(0)

			// TODO: catalog and category assignments
		})
	})
})