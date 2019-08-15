import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct  } from './common';

import { User } from '../src/models/userModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { Category } from '../src/models/categoryModel';
import { Catalog } from '../src/models/catalogModel';
import { Product, IProduct } from '../src/models/productModel';
import { Schema } from 'mongoose';
const { OK, BAD_REQUEST } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

describe('Product', function() {

	before(async function() {
		console.log(chalk.blue('[Product] before'))
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
		console.log(chalk.blue('[Product] before END'))
	})

	beforeEach(async function() {
		console.log(chalk.blue('[Product] beforeEach'))
		await clearDataBase(Category, Catalog)
		// Create catalog
		ret = await createCatalog(catalogData.id, {isMaster: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(catalogData.id, categoryData.id)
		category = ret.body
		console.log(chalk.blue('[Product] beforeEach END'))
	})

	describe('Create', () => {
		it('Should create a product', async() => {
			console.log(chalk.blue('Should create a product'));
			ret = await createProduct(catalogData.id, productData.id, {name: productData.name})
			// Should return a product
			ret.status.should.equal(OK)
			// Product should exist
			let product: IProduct = await Product.findOne({id: productData.id}).populate([
				{ path: 'masterCatalog', populate: { path: 'products' } }
			]).exec()
			product.masterCatalog.should.exist
			product.masterCatalog.products.find((_product: IProduct) => _product.id == productData.id).should.exist
		})
		describe('Should fail if ...')
	})

	describe('Update', function() {
		beforeEach(async function() {
			console.log(chalk.blue('[Product Update] beforeEach'))
			product = await createProduct(catalogData.id, productData.id, {name: productData.name})
			console.log(chalk.blue('[Product Update] beforeEach END'))
		})
		it('Should update name', async () => {
			console.log(chalk.blue('Should update name'))
			let newName = 'newName'
			ret = await updateProduct(productData.id, {
				name: newName
			})
			ret.status.should.equal(OK)
			let _product: IProduct = await Product.findOne({id: productData.id}).populate({ path: 'assignedCategoriesByCatalog' }).exec()
			_product.name.should.equal(newName)
		})
		it('Should update master catalog', async() => {
			console.log(chalk.blue('Should update master catalog'))
			let newCatalogId = 'newcatalog'
			ret = await createCatalog(newCatalogId)
			ret.status.should.equal(OK)
			ret = await updateProduct(productData.id, {
				masterCatalog: newCatalogId
			})
			printret(ret)
			ret.status.should.equal(OK)
			let _product: IProduct = await Product.findOne({id: productData.id}).populate({ path: 'masterCatalog', populate: { path: 'products'}}).exec()
			_product.masterCatalog.id.should.equal(newCatalogId)
			_product.masterCatalog.products.find((_product: IProduct) => _product.id == productData.id).should.exist
		})
		it.only('Should update primaryCategory', async() => {
			console.log(chalk.blue('Should update primaryCategory'))
			let newCategoryId = 'newcatgory'
			ret = await createCategory(catalogData.id, newCategoryId)
			ret.status.should.equal(OK)
			ret = await updateProduct(productData.id, {
				primaryCategoryByCatalog: [{
					catalog: catalogData.id,
					category: newCategoryId
				}]
			})
			printret(ret)
			ret.status.should.equal(OK)
			
		})
		it('Should update assignedCategoriesByCatalog', async() => {
			console.log(chalk.blue('Should update assignedCategoriesByCatalog'))
			ret = await updateProduct(productData.id, {
				assignedCategoriesByCatalog: {
					[catalogData.id]: [categoryData.id]
				}
			})
			printret(ret)
			ret.status.should.equal(OK)
			let _product: IProduct = await Product.findOne({id: productData.id}).populate({ path: 'assignedCategoriesByCatalog' }).exec()
			console.log(_product)
		})
		
		it('Should update catalog assignements')
		
		it('Should update name')
	})
})