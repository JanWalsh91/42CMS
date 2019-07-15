import app from '../src/app'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
chai.use(chaiHttp)
const agent = chai.request.agent(app)

import { User } from '../src/models/userModel'
import { Project } from '../src/models/projectModel'
// import { Catalog } from '../src/models/catalogModel'
import { Category } from '../src/models/categoryModel'
// import { Product } from '../src/models/productModel'

export const userData = 
	{
		name: 'John Smith',
		username: 'jsmith',
		password: 'password',
		projectName: 'Default project',
		projectId: 'defaultProject'
	}

export const clearDataBase = async (models?: any[]) => {
	if (!models) {
		models = [
			User,
			Project
		]
	}
	await Promise.all(models.map(model => model.deleteMany({})))
}

// ===== USERS ===== //

	export const getAllUsers = () =>
		agent.get('/users')

	// Creates and logs in user (Sets sessionID)
	export const createUser = (params: {username: string, password: string, projectName: string, projectId: string, name?: string}) => 
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

// ===== PROJECTS ===== //

	export const createProject = (params: {name: string, id: string}) =>
		agent.post('/projects').send(params)

	// Gets all projects of user (set by session)
	export const getProjects = () => 
		agent.get('/projects')

	// Gets project id of user (set by session)
	export const getProject = (projectid: string) =>
		agent.get(`/projects/${projectid}`)

// ===== CATALOGS ====== //

	export const createCatalog = (projectid: string, catalogid: string) =>
		agent.post(`/projects/${projectid}/catalogs/`).send({id: catalogid})

	export const getCatalog = (projectid: string, catalogid: string) =>
		agent.get(`/projects/${projectid}/catalogs/${catalogid}`)
	
	export const getAllCatalogs = (projectid: string) =>
		agent.get(`/projects/${projectid}/catalogs`)

// ===== CATEGORIES ====== //

	// export const createCategory = (params: {projectId: string, catalogId: string, id: string}) =>
	// 	agent.post(`/projects/${params.projectId}/catalogs/${params.catalogId}`).send({id: params.id})

	// export const getCategory = (params: {projectId: string, id: string}) =>
	// 	agent.get(`/projects/${params.projectId}/catalogs/${params.id}`)

	// export const getAllCategories = (params: {projectId: string}) =>
	// 	agent.get(`/projects/${params.projectId}/catalogs`)

// ===== UTILITY ===== //

export const printret = ret => {
	console.log({status: ret.status, body: ret.body})
}

