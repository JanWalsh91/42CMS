import app from '../src/app'
import * as chai from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);
const agent = chai.request.agent(app)

import { User } from '../src/models/user';
import { Project } from '../src/models/project';

export const userData = 
	{
		name: 'John Smith',
		username: 'jsmith',
		password: 'password',
		projectName: 'Default project'
	};

export const clearDataBase = async (models?: any[]) => {
	if (!models) {
		models = [
			User,
			Project
		];
	}
	await Promise.all(models.map(model => model.deleteMany({})));
};

// ===== USERS =====

export const getAllUsers = () =>
	agent.get('/users');

// Logs in user (sets cookie)
export const createPortalUser = (params: {username: String, password: String, projectName: String, name?: String}) => 
	agent.post('/users').send(params);

// ===== PROJECTS =====

export const createProject = (params: {name: String}) =>
	agent.post('/projects').send(params);

// Gets all projects of user (set by session)
export const getProjects = () => 
	agent.get('/projects');

// Gets project id of user (set by session)
export const getProject = (params: {id: String}) =>
	agent.get(`/projects/${params.id}`);

// ===== UTILITY =====

export const printret = ret => {
	console.log({status: ret.status, body: ret.body});
};

