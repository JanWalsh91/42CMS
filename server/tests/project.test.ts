import * as chai from 'chai';
chai.should();

import { userData, getAllUsers, createPortalUser, printret, createProject } from './common'

import User from '../src/models/user';
import Project from '../src/models/project';

let ret: any;

describe('Project', () => {
	let userid: string;

	beforeEach(async () => {
		await Promise.all([User.remove({}), Project.remove({})]);
		ret = await createPortalUser(userData);
		console.log('created user')
		printret(ret)
		userid = ret.body._id;
	});

	describe('Create', () => {
		it('Should create a project', async() => {
			ret = await createProject({name: 'my project', owner: userid})
			printret(ret)
			ret.should.have.status(200)
		});
	});

});