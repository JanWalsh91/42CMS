import { Request, Response } from 'express';
import chalk from 'chalk';

import { User, IUser } from '../models/user';
import { Project, IProject } from '../models/project';
import { uuid } from '../utils/uuid';
import ResponseStatusTypes from "../utils/ResponseStatusTypes";
import { ServerError, ErrorType } from '../utils/ServerError';

const { BAD_REQUEST } = ResponseStatusTypes;

export const userController = {
	/**
	 * Creates a new user and project
	 */
	async create(req: Request, res: Response) {
		console.log(chalk.magenta('[UserContoller] create'), req.body);
		// save params
		const { username, password, projectName, name } = req.body;
		
		// Check if user exists
		let existingUsers: IUser[] = await User.find({username});
		console.log(existingUsers);
		if (existingUsers.length > 0) {
			console.log(chalk.red('user already exists'))
			res.statusCode = BAD_REQUEST;
			res.send(new ServerError(ErrorType.USER_EXISTS, username));
			return ;
		}
		// Create new user
		let newUser: IUser = new User({
			username: username,
			name: name,
			password: password,
			apiKey: uuid('apiKey')
		});
		// Create new project (TODO: use Project API ?)
		let newProject: IProject = new Project({
			name: projectName,
			owner: newUser._id
		});
		newUser.projects = [newProject._id];
		// TODO: handle errors
		try {
			await Promise.all([newUser.save(), newProject.save()]);
		} catch (e) {
			console.log(e);
			res.statusCode = BAD_REQUEST;
			res.send({error: e});
			return ;
		}
		if (req.session) {
			req.session.apiKey = newUser.apiKey;
		}
		res.send({user: newUser, project: newProject})
	},

	async getAll(req: Request, res: Response) {				
		User.find({}, (err, user) => {
			if (err){
				res.send(err);
			}
			res.send(user);
		});
	},

	// set session
	async setSession(req: Request, res: Response) {
		console.log(chalk.magenta('[userController] setSession'));
		if (req.session && req.session.apiKey) {
			User.findOne({apiKey: req.session.apiKey}, (err: any, user: IUser) => {
				if (err) {
					console.log('[authorize]', chalk.red('forbidden'));
					res.statusCode = ResponseStatusTypes.FORBIDDEN
					res.end();
					return ;
				} else {
					console.log('[authorize]', chalk.green('ok'));
					res.send({name: user.name, id: user._id});
				}
			});
		} else {
			res.statusCode = ResponseStatusTypes.FORBIDDEN
			res.send();
		}
	},

	async login(req: Request, res: Response) {
		console.log(chalk.magenta('[User.login]'), req.body);
		const { username, password } = req.body;

		let user: IUser = await User.findOne({username, password});
		if (!user) {
			res.statusCode = ResponseStatusTypes.UNAUTHORIZED;
			res.send(new ServerError(ErrorType.BAD_LOGIN));
		} else {
			req.session.apiKey = user.apiKey
			res.send({message: 'login success', user: { username: user.username}})
		}
	},

	get(req: Request, res: Response) {
		console.log(chalk.magenta('[User] get'));
		res.send({user: req.params.user});				
		// User.findById(req.params.userid, (err, user) => {
		// 	if (err){
		// 		res.send(err);
		// 	}
		// 	res.json(user);
		// });
	},

	update(req: Request, res: Response) {				
		User.findOne({}, (err, user) => {
			if (err){
				res.send(err);
			}	
			res.json(user);
		});
	},

	delete(req: Request, res: Response) {				
		User.remove({}, (err) => {
			if (err){
				res.send(err);
			}
			res.end()
		});
	},

	async exists(params: any) {
		return new Promise(resolve =>
			User.findOne((params), (err, user) => 
				resolve(err || user)
			)
		);
	}
}
