import app from '../src/app'
import * as chai from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);

export const userData = 
	{
		firstName: 'John',
		lastName: 'Smith'
	}

// ===== USERS =====

export const getAllUsers = () => {
	return chai.request(app).get('/user');
};

export const createPortalUser = (params: {firstName: String, lastName: String}) => {
	return chai.request(app).post('/user').send(params)
};

// ===== PROJECTS =====

export const createProject = (params: {name: String, owner: String}) => {
	return chai.request(app).post('/project').send(params)
};


// ===== UTILITY =====

export const printret = ret => {
	console.log({status: ret.status, body: ret.body});
};

