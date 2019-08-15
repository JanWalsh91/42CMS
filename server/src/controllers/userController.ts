import { Request, Response } from 'express'
import chalk from 'chalk'

import { User, IUser } from '../models/userModel'
import { userService } from '../services'

import ResponseStatusTypes from "../utils/ResponseStatusTypes"
import { ValidationError, UnauthorizedError, LoginError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors'
import { NOTFOUND } from 'dns';

const { NOT_IMPLEMENTED } = ResponseStatusTypes

export const userController = {

	async create(req: Request, res: Response) {
		console.log(chalk.magenta('[UserContoller.create]'))
		// save params
		const { username, password, name } = req.body
		
		if (!username) {
			throw new ValidationError('Username not provided')
		}
		if (!password) {
			throw new ValidationError('Password not provided')
		}

		let user = await userService.create({username, password, name})
		if (req.session) {
			req.session.apiKey = user.apiKey
		}
		res.send({user})
	},

	async getAll(req: Request, res: Response) {				
		console.log(chalk.magenta('[UserContoller.getAll]'))
		let users: IUser[] = await userService.getAll()
		res.send(users)
	},

	// Sets the session object
	async setSession(req: Request, res: Response) {
		console.log(chalk.magenta('[userController.setSession]'))
		if (req.session && req.session.apiKey) {
			let user: IUser = await userService.getByAPIKey(req.session.apiKey)
			if (!user) {
				throw new UnauthorizedError('unauthorized')
			} else {
				console.log('[authorize]', chalk.green('ok'))
				// TODO: to front end user
				res.send({name: user.name, id: user._id})
				return 
			}
		} else {
			throw new UnauthorizedError('unauthorized')
		}
	},

	async login(req: Request, res: Response) {
		console.log(chalk.magenta('[User.login]'))
		const { username, password } = req.body

		let user: IUser = await User.findOne({username, password})
		if (!user) {
			throw new LoginError()
		} else {
			req.session.apiKey = user.apiKey
			// TODO: prepare model for front
			res.send({message: 'Login success', user: { username: user.username }})
		}
	},

	async logout(req: Request, res: Response) {
		console.log(chalk.magenta('[User.logout]'))
		if (req.session) {
			req.session.destroy(err => {
				if (err) { throw (err) }
				res.send('Logout Success')
			});
		} else {
			res.send('Not logged in')
		}
	},

	async get(req: Request, res: Response) {
		console.log(chalk.magenta('[User.get]'))
		let user: IUser = await userService.getByUsername(req.body.username)
		if (!user) {
			throw new ResourceNotFoundError('user')
		}
		res.send({user: req.params.user})
	},

	// TODO
	async update(req: Request, res: Response) {
		console.log(chalk.magenta('[UserContoller.update]'))
		throw new NotImplementedError()
	},

	async delete(req: Request, res: Response) {				
		console.log(chalk.magenta('[UserContoller.delete]'))
		const { username } = req.body
		
		if (!username) {
			throw new ValidationError('username not provided')
		}
		await userService.deleteUser(username)
		res.send('User deleted')
	},

}
