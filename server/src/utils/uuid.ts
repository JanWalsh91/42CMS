import * as v4 from 'uuid/v4'

export const prefixes = {
	apiKey: '_KEY',
	user: 'USER',
};

export const uuid = (type: 'apiKey'|'user') => {
	return prefixes[type] + '-' + v4();
}