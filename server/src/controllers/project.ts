import { Project } from '../models/project'
import { User, IUser } from '../models/user'
import { Request, Response } from 'express';
import chalk from 'chalk';

export class ProjectController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[ProjectContoller] create'), req.body);
		const { name, user } = req.body; // User acquired from authorization middleware
	   
		const newProject = new Project({name, owner: user._id});
    
        newProject.save((err, project) => {
            if (err){
                res.send(err);
            } else {
				res.json(project);
			}
        });
	}

	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[ProjectContoller] get'), req.body);
		let user = await User.findById(req.body.owner);

		// get all projects of user
		// let project = Project.find
	
		
		// return all projects
		res.end();
	}
}

export const projectController: ProjectController = new ProjectController();


