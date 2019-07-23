import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createProject, projectData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct  } from './common';

import { User } from '../src/models/userModel'
import { Project, IProject } from '../src/models/projectModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { Category } from '../src/models/categoryModel';
import { Catalog } from '../src/models/catalogModel';
import { Product, IProduct } from '../src/models/productModel';
import { Schema } from 'mongoose';
const { OK, BAD_REQUEST } = ResponseStatusTypes 

let ret: any;
let project: any = {}
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
		await clearDataBase(Project, Category, Catalog)
		// Create project
		ret = await createProject(projectData)
		project = ret.body
		// Create catalog
		ret = await createCatalog(project.id, catalogData.id, {isMaster: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(project.id, catalogData.id, categoryData.id)
		category = ret.body
		console.log(chalk.blue('[Product] beforeEach END'))
	})

	describe('Create', () => {
		it('Should create a product', async() => {
			console.log(chalk.blue('Should create a product'));
			ret = await createProduct(project.id, catalogData.id, productData.id, {name: productData.name})
			// Should return a product
			ret.status.should.equal(OK)
			// Product should exist
			let product: IProduct = await Product.findOne({id: productData.id}).populate([
				{ path: 'project', populate: { path: 'products' } },
				{ path: 'masterCatalog', populate: { path: 'products' } }
			]).exec()
			product.masterCatalog.should.exist
			product.masterCatalog.products.find((_product: IProduct) => _product.id == productData.id).should.exist
			product.project.should.exist
			product.project.products.find((_product: IProduct) => _product.id == productData.id).should.exist
		})
		describe('Should fail if ...', () => {
			it('Product of that id already exists in project', async() => {
				console.log(chalk.blue('Should fail if ... Product of that id already exists in project'));
				return 
			})
		})
	})

	describe('Update', function() {
		beforeEach(async function() {
			console.log(chalk.blue('[Product Update] beforeEach'))
			product = await createProduct(project.id, catalogData.id, productData.id, {name: productData.name})
			console.log(chalk.blue('[Product Update] beforeEach END'))
		})
		it.only('Should update assignedCategoriesByCatalog', async() => {
			console.log(chalk.blue('Should update assignedCategoriesByCatalog'))
			ret = await updateProduct(project.id, productData.id, {
				assignedCategoriesByCatalog: {
					[catalogData.id]: [categoryData.id]
				}
			})
			printret(ret)
			ret.status.should.equal(OK)
			let _product: IProduct = await Product.findOne({id: productData.id}).populate({ path: 'assignedCategoriesByCatalog' }).exec()
			console.log(_product)
		})
		it('Should update primaryCategory')
		it('Should update catalog assignements')
		it('Should update master catalog', async() => {
			console.log(chalk.blue('Should update master catalog'))
			let newCatalogId = 'newcatalog'
			ret = await createCatalog(projectData.id, newCatalogId)
			ret.status.should.equal(OK)
			ret = await updateProduct(project.id, productData.id, {
				masterCatalog: newCatalogId
			})
			printret(ret)
			ret.status.should.equal(OK)
			let _product: IProduct = await Product.findOne({id: productData.id}).populate({ path: 'masterCatalog', populate: { path: 'products'}}).exec()
			_product.masterCatalog.id.should.equal(newCatalogId)
			_product.masterCatalog.products.find((_product: IProduct) => _product.id == productData.id).should.exist
		})
		it('Should update name')
	})
})