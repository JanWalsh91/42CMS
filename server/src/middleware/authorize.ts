import chalk from 'chalk'

import { Response, Request, NextFunction } from 'express'
import { User } from '../models'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'

/**
 * Authorizes a user based on apiKey in cookie in header.
 * Sets req.locals.user to current user
 * 
 * Ends request if not authorized with error msg.
 */
export default async (req: Request, res: Response, next: NextFunction) => {
	console.log(chalk.magenta('AUTHORIZING'));
	if (!req || !req.hasOwnProperty('session')) {
		return notAuthorized('No session');
	}
	if (req.session.hasOwnProperty('apiKey')) {
		// console.log(chalk.green('got api key! =>', req.session.apiKey));
		User.findOne({apiKey: req.session.apiKey}, (err, user) => {
			if (err) {
				return notAuthorized('User not found. Error:' + err)
			} else if (user) {
				console.log(chalk.green('Found user! =>', user.username));
				res.locals.user = user;
				next();
			} else {
				return notAuthorized('User not found. ' + err)
			}
		});
	} else {
		return notAuthorized('No apiKey');
	}

	function notAuthorized(errMsg: string) {
		console.log(chalk.red('Not authorized:', errMsg))
		res.statusCode = ResponseStatusTypes.UNAUTHORIZED;
		res.send({error: 'Unauthorized'});
	}
}