import { IUser, User } from "../models";
import { ValidationError, ResourceNotFoundError } from "../utils/Errors";
import { uuid } from "../utils/uuid";

class UserService {
	public async create(options: Partial<IUser>): Promise<IUser> {
		// Check if user exists
		let existingUsers: IUser[] = await User.find({username: options.username})
		if (existingUsers.length > 0) {
			throw new ValidationError('User already exists')
		}
		
		// Create new user
		return await new User({
			username: options.username,
			name: options.name,
			password: options.password,
			apiKey: uuid('apiKey')
		}).save()
	}

	public async getByUsername(usernamae: string): Promise<IUser> {
		return User.findOne({usernamae}).exec()
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

	public async deleteUser(username: string): Promise<void> {
		let user: IUser = await this.getByUsername(username)
		if (!user) {
			throw new ResourceNotFoundError('User', username)
		}
		await User.findOneAndDelete({username})
	}
}

export const userService: UserService = new UserService()