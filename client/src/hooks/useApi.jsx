import api from '../utils/api';

// debug without server
const WITH_SERVER = true;

export default (method, path, dependencies) => {

	const fetch = async() => {
		console.log('[useApi] fetch', {method, path});

		if (WITH_SERVER) {
			return await api[method](path)
				.then(response => {
					console.log('[useApi] SUCCESS', response);
					return response;
				})
				.catch(error => {
					console.log('[useApi] ERROR', error);
				})
		} else {
			await (new Promise(resolve => setTimeout(resolve, 500)));
			return 0;
		}
	};

	return { fetch }
}