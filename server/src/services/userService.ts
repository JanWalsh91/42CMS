import { User } from '../models'
import { IUser } from '../interfaces'
import { ValidationError, ResourceNotFoundError, ServerError, UnauthorizedError } from '../utils/Errors'
import { uuid } from '../utils/uuid'

class UserService {
	public async create(options: Partial<IUser>): Promise<IUser> {
		// Check if user exists
		let existingUsers: IUser[] = await User.find({username: options.username})
		if (existingUsers.length > 0) {
			throw new ValidationError('User already exists')
		}
	
		// First user created is admin
		const isFirstUser: boolean = (await User.count({}).exec()) == 0

		// Create new user
		return await new User({
			username: options.username,
			name: options.name,
			password: options.password,
			apiKey: uuid('apiKey'),
			admin: isFirstUser
		}).save()
	}

	public async getByUsername(username: string): Promise<IUser> {
		return User.findOne({username}).exec()
	}

	public async getByAPIKey(apiKey: string): Promise<IUser> {
		return User.findOne({apiKey}).exec()
	}

	public async findAll(query: object): Promise<IUser[]> {
		return User.find(query).exec()
	}

	public async getAll(): Promise<IUser[]> {
		// TODO: format user object for non Database use
		return User.find({}).exec()
	}

	public async deleteUser(username: string, currentUser: IUser): Promise<void> {
		const user: IUser = await this.getByUsername(username)
		if (!user) {
			throw new ResourceNotFoundError('User', username)
		}
		if (user.admin) {
			throw new UnauthorizedError('Cannot delete an admin')
		}
		if (user.id != currentUser.id) {
			if (!currentUser.admin) {
				throw new UnauthorizedError('Must be an admin to delete another user')
			}
		}
		await User.findOneAndDelete({username})
	}
}

export const userService: UserService = new UserService()