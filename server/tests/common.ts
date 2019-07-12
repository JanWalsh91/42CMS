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
		password: 'password',
		projectName: 'my project'
	}

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
export const createPortalUser = (params: {name: String, password: String, projectName: String}) => 
	agent.post('/users').send(params);

// ===== PROJECTS =====

export const createProject = (params: {name: String}) =>
	agent.post('/projects').send(params);

export const getProjects = () => 
	agent.get('/projects');

export const getProject = (params: {id: String}) =>
	agent.get(`/projects/${params.id}`);

// ===== UTILITY =====

export const printret = ret => {
	console.log({status: ret.status, body: ret.body});
};

