import { Response, Request, NextFunction } from 'express';
import chalk from 'chalk';

export default (req: Request, res: Response, next: NextFunction) => {
	console.log(chalk.red('AUTH'), req.session)
	// get session
	if (req.session.hasOwnProperty('apiKey')) {
		next()
	} else {
		next(new Error('Unautorized'))
	}
}
