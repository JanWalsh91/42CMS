export class ServerError {
	code: number
	message: string

	constructor(code: ErrorType, message?: string) {
		this.code = code;
		this.message = ErrorMessages[code](message);
	}
}

export enum ErrorType {
	FORBIDDEN,
	UNAUTHORIZED,
	USER_EXISTS,
	BAD_LOGIN,
}

export const ErrorMessages: {[code: string]: Function} = {
	[ErrorType.FORBIDDEN]: () => 'Forbidden',
	[ErrorType.UNAUTHORIZED]: () => `You are unauthorized to access this resource`,
	[ErrorType.USER_EXISTS]: username => `User ${username ? username + ' ' : ''}already exists`,
	[ErrorType.BAD_LOGIN]: () => `Wrong username or password`,
}