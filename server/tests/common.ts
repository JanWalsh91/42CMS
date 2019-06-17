import app from '../src/app'
import * as chai from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);

export const userData = 
	{
		name: 'John Smith',
		password: 'password',
		projectName: 'my project'
	}

// ===== USERS =====

export const getAllUsers = () => {
	return chai.request(app).get('/users');
};

export const createPortalUser = (params: {name: String, password: String, projectName: String}) => {
	return chai.request(app).post('/users').send(params)
};

// ===== PROJECTS =====

export const createProject = (params: {name: String, owner: String}) => {
	return chai.request(app).post('/projects').send(params)
};


// ===== UTILITY =====

export const printret = ret => {
	console.log({status: ret.status, body: ret.body});
};

