import app from '../src/app'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
chai.use(chaiHttp)
const agent = chai.request.agent(app.app)
import chalk from 'chalk'
import { Model } from 'mongoose'
import * as fs from 'fs'

import { User, Catalog, Category, Product, Site, Locale, GlobalSettings, ObjectTypeDefinition, LocalizableAttribute } from '../src/models'
import { patchAction, patchRequest } from '../src/utils'

export const userData = {
	name: 'John Smith',
	username: 'jsmith',
	password: 'password'
}

export const catalogData = {
	name: 'International',
	id: 'international'
}

export const categoryData = {
	name: 'Fragrance',
	id: 'fragrance'
}

export const productData = {
	name: 'Miss Dior',
	id: 'missdior'
}

export const clearDataBase = async (...models: Model<any>[]) => {
	console.log(chalk.red('[clearDatabase]: ' + (models.length ? models.map(model => model.modelName).join(', ') : 'all models')))
	if (!models.length) {
		models = [
			User,
			Catalog,
			Site,
			Category,
			Product,
			Locale,
			GlobalSettings,
			ObjectTypeDefinition,
			LocalizableAttribute,
		]
	}
	await Promise.all(models.map(model => model.deleteMany({})))
	if (models.some(model => ['GlobalSettings', 'Locale', 'ObjectTypeDefinition'].includes(model.modelName))) {
		await app.init()
	}
}

// ===== USERS ===== //

	export const getUser = (username: string) => 
		agent.get(`/users/${username}`)

	export const getAllUsers = () =>
		agent.get('/users')

	// Creates and logs in user (Sets sessionID)
	export const createUser = (params: {username: string, password: string, name?: string}) => 
		agent.post('/users').send(params)

	// Authorize user (with sessionID)
	export const authUser = () => 
		agent.get('/auth')

	// Login user
	export const login = (params: {username: string, password: string}) => 
		agent.post('/login').send(params)

	// Logout user
	export const logout = () => 
		agent.post('/logout')

	// Delete user
	export const deleteUser = (userid?: string) =>
		agent.delete(`/users${userid ? `/${userid}` : ''}`)

// ===== CATALOGS ====== //

	export const createCatalog = (catalogid: string, params?: object) =>
		agent.post(`/catalogs/`).send({id: catalogid, ...params})

	export const getCatalog = (catalogid: string) =>
		agent.get(`/catalogs/${catalogid}`)
	
	export const getAllCatalogs = () =>
		agent.get(`/catalogs`)

	export const updateCatalog = (catalogid: string, patch: patchRequest) =>
		agent.patch(`/catalogs/${catalogid}`).send(patch)

	export const deleteCatalog = (catalogid: string) =>
		agent.delete(`/catalogs/${catalogid}`)

// ===== CATEGORIES ====== //

	export const createCategory = (catalogid: string, categoryid: string, params?: object) =>
		agent.post(`/catalogs/${catalogid}/categories`).send({id: categoryid, ...params})

	export const getCategory = (catalogid: string, categoryid: string) =>
		agent.get(`/catalogs/${catalogid}/categories/${categoryid}`)

	export const getAllCategories = (catalogid: string) =>
		agent.get(`/catalogs/${catalogid}/categories`)

	export const updateCategory = (catalogid: string, categoryid: string, patch: patchRequest) =>
		agent.patch(`/catalogs/${catalogid}/categories/${categoryid}`).send(patch)

	export const deleteCategory = (catalogid: string, categoryid: string) =>
		agent.delete(`/catalogs/${catalogid}/categories/${categoryid}`)

// ===== PRODUCTS ====== //

	export const createProduct = (mastercatalogid: string, productid: string, params?: object) => 
		agent.post(`/products`).send({id: productid, mastercatalogid, ...params})
	
	export const getProduct = (productid: string) =>
		agent.get(`/products/${productid}`)

	export const getAllProducts = () =>
		agent.get(`/products`)

	export const updateProduct = (productid: string, patch: patchRequest) => 
		agent.patch(`/products/${productid}`).send(patch)

	export const deleteProduct = (productid: string) =>
		agent.delete(`/products/${productid}`)

// ===== GLOBAL SETTINGS ===== //

	export const getGlobalSettings = () =>
		agent.get(`/globalsettings`)
	
	export const updateGlobalSettings = (patch: patchRequest) => 
		agent.patch(`/globalsettings`).send(patch)

// ===== LOCALES ===== //

	export const getAllLocales = () =>
		agent.get(`/locales`)

	export const updateLocale = (localeid: string, patch: patchRequest) =>
		agent.patch(`/locales/${localeid}`).send(patch)

// ===== OBJECT TYPE DEFINITION ===== //

	export const getObjectTypeDefinition = (objecttype: string) =>
		agent.get(`/objecttypedefintions/${objecttype}`)

	export const updateObjectTypeDefinition = (objecttype: string, patch: patchRequest) =>
		agent.patch(`/objecttypedefintions/${objecttype}`).send(patch)

	export const updateObjectAttributeDefinition = (objecttype: string, path: string, patch: patchRequest) =>
		agent.patch(`/objecttypedefintions/${objecttype}/${path}`).send(patch)

// ===== IMAGES ===== //

	export const uploadImage = (path: string, options: any) => 
		agent
			.post(`/images`)
			.attach('image', fs.readFileSync(path))
			// .send(options)

// ===== UTILITY ===== //

	export const printret = ret => {
		console.log({status: ret.status, body: ret.body})
	}