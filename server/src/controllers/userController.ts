import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { User } from '../models'
import { IUser } from '../interfaces'
import { userService } from '../services'

import { ValidationError, UnauthorizedError, LoginError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors'

export const userController = {

	async create(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[UserContoller.create]'))
		const { username, password, name } = req.body
		
		if (!username) {
			return next(new ValidationError('Username not provided'))
		}
		if (!password) {
			return next(new ValidationError('Password not provided'))
		}
		try {
			const user = await userService.create({username, password, name})
			if (req.session) {
				req.session.apiKey = user.apiKey
			}
			res.send({user})
		} catch (e) { next(e) }
	},

	async get(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[User.get]'))
		try {
			const user: IUser = await userService.getByUsername(req.params.username)
			if (!user) {
				return next(new ResourceNotFoundError('user', req.params.username))
			}
			res.send(user)
		} catch (e) { next(e) }
	},

	async getAll(req: Request, res: Response, next: NextFunction) {				
		console.log(chalk.magenta('[UserContoller.getAll]'))
		try {
			const users: IUser[] = await userService.getAll()
			res.send(users)
		} catch (e) { next(e) }		
	},

	// Sets the session object
	async setSession(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[userController.setSession]'))
		if (req.session && req.session.apiKey) {
			try {
				const user: IUser = await userService.getByAPIKey(req.session.apiKey)
				if (!user) {
					return next(new UnauthorizedError('unauthorized'))
				} else {
					console.log('[authorize]', chalk.green('ok'))
					// TODO: to front end user
					res.send({name: user.name, id: user._id})
					return 
				}
			} catch (e) { next(e) } 
		} else {
			return next(new UnauthorizedError('unauthorized'))
		}
	},

	async login(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[User.login]'))
		const { username, password } = req.body

		try {
			const user: IUser = await User.findOne({username, password})
			if (!user) {
				return next(new LoginError())
			} else {
				req.session.apiKey = user.apiKey
				// TODO: prepare model for front
				res.send({message: 'Login success', user: { username: user.username }})
			}
		} catch (e) { next(e) }
	},

	async logout(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[User.logout]'))
		if (req.session) {
			req.session.destroy(err => {
				if (err) { return next(err) }
				res.send('Logout Success')
			});
		} else {
			res.send('Not logged in')
		}
	},

	// TODO
	async update(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.magenta('[UserContoller.update]'))
		return next(new NotImplementedError())
	},

	async delete(req: Request, res: Response, next: NextFunction) {				
		console.log(chalk.magenta('[UserContoller.delete]'))
		let { username } = req.params

		const currentUser: IUser = await userService.getByAPIKey(req.session.apiKey)
		if (!currentUser) {
			return next(new ResourceNotFoundError('User', 'session user'))
		}
		
		if (!username) {
			username = currentUser.username
		}

		try {
			await userService.deleteUser(username, currentUser)
			res.send('User deleted')
		} catch (e) { next(e) }
	},
}
