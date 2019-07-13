import api from '../utils/api';

// debug without server
const WITH_SERVER = true;

export default (method, path, dependencies) => {

	/**
	 * Returns reponse body on success
	 * Returns Error: { code: String, message: String } on error
	 */
	return async({body, params}) => {
		// TODO: implement params if necessary
		console.log('%c[useApi] fetch', 'color: magenta; font-size: 200%;', {method, path, body, params});

		if (WITH_SERVER) {
			return api[method](path, body)
			.then(response => {
				console.log('%c [useApi] SUCCESS', 'color: green', response);
				return response.data;
			})
			.catch(error => {
				console.log('%c [useApi] ERROR', 'color: red', {error: error, response: error.response, data: error.response.data});
				if (error.response && error.response.data) {
					console.log(1)
					throw error.response.data;
				} else {
					console.log(2)
					throw {message: 'Failed to fetch data'};
				}
			});
		} else {
			await (new Promise(resolve => setTimeout(resolve, 500)));
			return 0;
		}
	};
}