import app from '../src/app'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
chai.use(chaiHttp)
const agent = chai.request.agent(app)

import { User } from '../src/models/user'
import { Project } from '../src/models/project'

export const userData = 
	{
		name: 'John Smith',
		username: 'jsmith',
		password: 'password',
		projectName: 'Default project'
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

// ===== USERS =====

export const getAllUsers = () =>
	agent.get('/users')

// Creates and logs in user (Sets sessionID)
export const createUser = (params: {username: string, password: string, projectName: string, name?: string}) => 
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

// ===== PROJECTS =====

export const createProject = (params: {name: string}) =>
	agent.post('/projects').send(params)

// Gets all projects of user (set by session)
export const getProjects = () => 
	agent.get('/projects')

// Gets project id of user (set by session)
export const getProject = (params: {id: string}) =>
	agent.get(`/projects/${params.id}`)

// ===== UTILITY =====

export const printret = ret => {
	console.log({status: ret.status, body: ret.body})
}

