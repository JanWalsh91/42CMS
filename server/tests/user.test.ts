import * as chai from 'chai';
chai.should();

import { userData, getAllUsers, createPortalUser, printret } from './common'

import User from '../src/models/user';

let ret: any;

describe('User', function() {
	beforeEach(async () => {
		await User.remove({});
	});

	describe('Create', function() {
		it('Should create a user', async () => {
			ret = await createPortalUser(userData)
			printret(ret)
			ret.should.have.status(200)
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