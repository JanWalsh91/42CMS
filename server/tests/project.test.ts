import * as chai from 'chai';
chai.should();

import { clearDataBase, userData, getAllUsers, createPortalUser, printret, createProject, getProjects } from './common'

import { User } from '../src/models/user';
import { Project } from '../src/models/project';
import chalk from 'chalk';

let ret: any;

describe('Project', () => {
	let userid: string;

	beforeEach(async () => {
		console.log('[Project] beforeEach')
		await clearDataBase();
		ret = await createPortalUser(userData);
		printret(ret)
		userid = ret.body._id;
	});

	describe.only('Create', () => {
		it('Should create a project', async() => {
			console.log(chalk.blue('Should create a project'))
			ret = await createProject({name: 'Dior'});
			printret(ret)
			ret.should.have.status(200);
		});
	});

	describe('Get all', () => {
		it('Should get all projects by a user', async() => {
			await createProject({name: 'Dior'});
			ret = await getProjects();
			printret(ret);
			ret.should.have.status(200)			
		});
	});
});