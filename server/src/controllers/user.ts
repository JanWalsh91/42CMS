import { Request, Response } from 'express';
import chalk from 'chalk';

import { User, IUser } from '../models/user';
import { Project, IProject } from '../models/project';
import { uuid } from '../utils/uuid';
import ResponseStatusTypes from "../utils/ResponseStatusTypes";

export const userController = {
	async create(req: Request, res: Response) {
		console.log(chalk.green('[UserContoller] create'), req.body);
		if (await userController.exists({name: req.body.name})) {
			console.log(chalk.red('user already exists'))
			res.statusCode = ResponseStatusTypes.BAD_REQUEST;
			res.send({err: 'User already exists'});
			return ;
		}
		let newUser: IUser = new User({
			name: req.body.name,
			password: req.body.password,
			apiKey: uuid('apiKey')
		});
		let newProject: IProject = new Project({
			name: req.body.projectName,
			owner: newUser._id
		});
		newUser.projects = [newProject._id];
		await Promise.all([newUser.save(), newProject.save()]);
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

	async authorize(req: Request, res: Response) {
		console.log('[authorize]', req.session)
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
		console.log('[User.login]')
		let user: IUser = await User.findOne({
			name: req.body.name,
			password: req.body.password
		});
		if (!user) {
			res.statusCode = ResponseStatusTypes.FORBIDDEN
			res.send()
		} else {
			req.session.apiKey = user.apiKey
			res.send({message: 'login success', user: { name: user.name}})
		}
	},

	get(req: Request, res: Response) {
		console.log('[User] get')
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
		return new Promise(resolve => User.findOne((params), (err, user) => resolve(err || !user)));
	}
}
