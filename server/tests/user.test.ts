import * as chai from 'chai';
chai.should();

import { userData, getAllUsers, createPortalUser, printret } from './common'

import { User } from '../src/models/user';
import { Project } from '../src/models/project';

let ret: any;

describe.only('User', function() {
	beforeEach(async () => {
		await User.remove({});
		await Project.remove({});
	});

	describe.only('Create', function() {
		it('Should create a user and a project', async () => {
			ret = await createPortalUser(userData)
			printret(ret)
			ret.should.have.status(200)
			// check if user exists
			// check if project exists
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