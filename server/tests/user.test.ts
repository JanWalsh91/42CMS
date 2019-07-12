import * as chai from 'chai';
chai.should();

import { clearDataBase, userData, getAllUsers, createPortalUser, printret } from './common'

import { User } from '../src/models/user';
import { Project } from '../src/models/project';

let ret: any;

describe('User', function() {
	beforeEach(async () => {
		console.log('[User] beforeEach')
		await clearDataBase();
	});

	describe('Create', function() {
		it('Should create a user and a project', async () => {
			ret = await createPortalUser(userData);
			// printret(ret);
			ret.should.have.status(200);
			// check if user exists
			const user = await User.find({apiKey: ret.body.user.apiKey});
			user.should.exist;
			// check if project exists
			const project = await Project.find({_id: ret.body.project._id});
			project.should.exist;
		});
	});

	describe('getAll', () => {
		it('Should get all users', async () => {
			ret = await getAllUsers();
			ret.should.have.status(200);
			ret.body.should.be.a('array');
			ret.body.length.should.be.eql(0);
		});
	});
});