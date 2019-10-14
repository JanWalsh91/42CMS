import { Request, Response, NextFunction } from 'express'

import { User } from '../models'
import { IUser } from '../interfaces'
import { userService } from '../services'
import { ValidationError, UnauthorizedError, LoginError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors'

export const userController = {

	async create(req: Request, res: Response, next: NextFunction) {
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
		try {
			const user: IUser = await userService.getByUsername(req.params.username)
			if (!user) {
				return next(new ResourceNotFoundError('user', req.params.username))
			}
			res.send(user)
		} catch (e) { next(e) }
	},

	async getAll(req: Request, res: Response, next: NextFunction) {				
		try {
			const users: IUser[] = await userService.getAll()
			res.send(users)
		} catch (e) { next(e) }		
	},

	// Sets the session object
	async setSession(req: Request, res: Response, next: NextFunction) {
		if (req.session && req.session.apiKey) {
			try {
				const user: IUser = await userService.getByAPIKey(req.session.apiKey)
				if (!user) {
					return next(new UnauthorizedError('unauthorized'))
				} else {
					res.send({name: user.name, id: user._id})
					return 
				}
			} catch (e) { next(e) } 
		} else {
			return next(new UnauthorizedError('unauthorized'))
		}
	},

	async login(req: Request, res: Response, next: NextFunction) {
		const { username, password } = req.body

		try {
			const user: IUser = await User.findOne({username, password})
			if (!user) {
				return next(new LoginError())
			} else {
				req.session.apiKey = user.apiKey
				res.send({message: 'Login success', user: { username: user.username }})
			}
		} catch (e) { next(e) }
	},

	async logout(req: Request, res: Response, next: NextFunction) {
		if (req.session) {
			req.session.destroy(err => {
				if (err) { return next(err) }
				res.send('Logout Success')
			});
		} else {
			res.send('Not logged in')
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		return next(new NotImplementedError())
	},

	async delete(req: Request, res: Response, next: NextFunction) {				
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
