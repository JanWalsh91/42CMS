import { Project, IProject } from '../models/projectModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class ProjectController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[ProjectContoller] create'), req.body);
		const { name, user, id } = req.body; // User acquired from authorization middleware
	   
		// Submitted project id must be unique
		const existingProject: IProject = await Project.findOne({id, owner: user._id});
		if (existingProject) {
			console.log(chalk.red(`${user.username} already has a project with id ${id} already exists`));
			res.statusCode = BAD_REQUEST;
			res.send({err: `${user.username} already has a p with id ${id} already exists`});
			return ;
		}
		const newProject: IProject = new Project({name, id, owner: user._id});

        newProject.save((err, project) => {
            if (err){
                res.send(err);
            } else {
				res.json({					// TODO: factorize
					name: project.name,
					owner: project.owner,
					id: project.id
				});
			}
        });
	}

	/**
	 * Get all projects of user
	 * 
	 * @param req 
	 * @param res 
	 */
	public async getAll(req: Request, res: Response) {
		console.log(chalk.magenta('[ProjectContoller] getAll'), req.body);
		let projects: any[] = await Project.find({owner: req.body.user._id});
		projects = projects.map(project => ({
			name: project.name,
			owner: project.owner,
			id: project.id
		}))
		res.send({projects})
	}

	/**
	 * Get project
	 * @param req
	 * @param res 
	 */
	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[ProjectContoller] get'), req.body);
		let projects: any[] = await Project.find({owner: req.body.user._id});
		projects = projects.map(project => ({
			name: project.name,
			owner: project.owner,
			id: project.id
		}))
		res.send({projects})
	}
}

export const projectController: ProjectController = new ProjectController();


