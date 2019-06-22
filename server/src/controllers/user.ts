import { Request, Response } from 'express';
import chalk from 'chalk';

import { User, IUser } from '../models/user';
import { Project, IProject } from '../models/project';
import { uuid } from '../utils/uuid';
import ResponseStatusTypes from "../utils/ResponseStatusTypes";

export class UserController {
	public async create(req: Request, res: Response) {
		console.log(chalk.green('[UserContoller] create'), req.body);
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
	}

	public getAll(req: Request, res: Response) {				
		User.find({}, (err, user) => {
			if (err){
				res.send(err);
			}
			res.send(user);
		});
	}

	public async authorize(req: Request, res: Response) {
		console.log('[authorize]', req.session)
		if (req.session && req.session.apiKey) {
			User.findOne({apiKey: req.session.apiKey}, (err: any, user: IUser) => {
				if (err) {
					console.log('[authorize]', chalk.red('forbidden'));
					res.statusCode = ResponseStatusTypes.FORBIDDEN
					res.send();
					return ;
				} else {
					console.log('[authorize]', chalk.green('ok'));
					res.end();
				}
			});
		} else {
			res.statusCode = ResponseStatusTypes.FORBIDDEN
			res.send();
		}
		
	}

	public async login(req: Request, res: Response) {
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
			res.send({message: 'login success'})
		}
	}

	public get(req: Request, res: Response) {
		console.log('[User] get')
		res.send({user: req.params.user});				
		// User.findById(req.params.userid, (err, user) => {
		// 	if (err){
		// 		res.send(err);
		// 	}
		// 	res.json(user);
		// });
	}

	public update(req: Request, res: Response) {				
		User.findOne({}, (err, user) => {
			if (err){
				res.send(err);
			}	
			res.json(user);
		});
	}

	public delete(req: Request, res: Response) {				
		User.remove({}, (err) => {
			if (err){
				res.send(err);
			}
			res.end()
		});
	}
}

export const userController: UserController = new UserController();