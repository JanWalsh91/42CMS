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
		res.send({user: newUser, project: newProject})
	}

	public getAll(req: Request, res: Response) {				
		User.find({}, (err, user) => {
			if (err){
				res.send(err);
			}
			res.json(user);
		});
	}

	public get(req: Request, res: Response) {				
		User.findById(req.params.userid, (err, user) => {
			if (err){
				res.send(err);
			}
			res.json(user);
		});
	}

	public update(req: Request, res: Response) {				
		User.find({}, (err, user) => {
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