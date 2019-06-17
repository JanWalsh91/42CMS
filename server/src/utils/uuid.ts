import * as v4 from "uuid/v4";

export const prefixes = {
	apiKey: '_KEY',
	user: 'USER',
	project: 'PROJ',
};

export const uuid = (type: 'apiKey'|'user'|'project') => {
	return prefixes[type] + '-' + v4();
}