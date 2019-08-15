import ResponseStatusTypes from './ResponseStatusTypes'
import chalk from 'chalk';
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR, UNAUTHORIZED, NOT_IMPLEMENTED } = ResponseStatusTypes

export class ServerError extends Error {
	httpCode: number

	constructor(httpCode: number, message: string) {
		super(message)
		this.httpCode = httpCode
		
		console.log(chalk.red(`ServerError[${httpCode}]: ${message}`))

		Error.captureStackTrace(this, this.constructor);
	}
}

export class ResourceNotFoundError extends ServerError {
	constructor(resource: string, query?: string) {
		super(NOT_FOUND, `${resource} ${query ? query : ''} not found`)
	}
}

export class InternalError extends ServerError {
	constructor(message: string) {
		super(SERVER_ERROR, message)
	}
}

export class ValidationError extends ServerError {
	constructor(message: string) {
		super(BAD_REQUEST, message)
	}
}

export class UnauthorizedError extends ServerError {
	constructor(message?: string) {
		super(UNAUTHORIZED, message ? message : 'You are unauthorized to access this resource')
	}
}

export class LoginError extends UnauthorizedError {
	constructor() {
		super('Bad username or password')
	}
}

export class NotImplementedError extends ServerError {
	constructor(message?: string) {
		super(NOT_IMPLEMENTED, message ? message : 'Feature not yet implemented')
	}
}