import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk';

import authorize from '../middleware/authorize'
import { Project, IProject } from '../models/projectModel'
import { projectController } from '../controllers/projectController'
import catalogs from './catalogsRoute'
import sites from './sitesRoute'
// import users from './usersRoute' // PROJECTUSER

const router: Router = Router()

router
	.use('/:projectid/catalogs', authorize, getProjectById, catalogs)
	.use('/:projectid/sites', authorize, getProjectById, sites)
	// .use('/:projectid/users', users)

	.get('/:projectid', authorize, getProjectById, projectController.get)
	.post('/', authorize, projectController.create)
	.get('/', authorize, projectController.getAll)

function getProjectById(req: Request, res: Response, next: NextFunction) {
	// console.log(chalk.magenta('[getProjectById]'))
	Project.findOne({id: req.params.projectid}, (err, project) => {
		if (err) {
			next(err);
		} else if (project) {
			// console.log(chalk.green('[getProjectById] SUCCESS'), project)
			req.body.project = project;
			next();
		} else {
			console.log(chalk.red('[getProjectById] FAIL'))
			next(new Error('failed to load project'));
		}
	})
}
export default router
