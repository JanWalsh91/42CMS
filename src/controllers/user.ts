import User from '../models/user';
import { Request, Response } from 'express';
import chalk from 'chalk';

export class UserController {
	public create(req: Request, res: Response) {
		console.log(chalk.green('[UserContoller] create'), req.body);           
        let newUser = new User(req.body);
    
        newUser.save((err, user) => {
            if (err){
                res.send(err);
            }    
            res.json(user);
        });
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