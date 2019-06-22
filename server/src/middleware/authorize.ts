import { Response, Request, NextFunction } from 'express';
import chalk from 'chalk';

export default (req: Request, res: Response, next: NextFunction) => {
	if (!req || !req.hasOwnProperty('session')) {
		next()
		return ;
	}
	console.log(chalk.red('AUTH'), req.session)
	// get session
	if (req.session.hasOwnProperty('apiKey')) {
		console.log(chalk.green('got api key!'))
	} else {
		console.log(chalk.red('not authorized'))
	}
	next();
}
