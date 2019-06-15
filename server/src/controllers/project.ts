import Project from '../models/project'
import User from '../models/user'
import { Request, Response } from 'express';
import chalk from 'chalk';

export class ProjectController {
	public async create(req: Request, res: Response) {
		console.log(chalk.blue('[ProjectContoller] create'), req.body);
		let user = await User.findById(req.body.owner)
        let newProject = new Project({...req.body, owner: user._id});
    
        newProject.save((err, project) => {
            if (err){
                res.send(err);
            }
            res.json(project);
        });
	}
}