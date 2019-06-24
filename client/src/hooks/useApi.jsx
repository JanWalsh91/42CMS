import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default (method, path, dependencies) => {

	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	const fetch = async() => {
		console.log('[useApi] useEffect', {method, path});
		setLoading(true)
		console.log('[useApi] fetching data ...')
		api[method](path)
			.then(response => {
				console.log('[useApi] SUCCESS', response);
			})
			.catch(error => {
				console.log('[useApi] ERROR', error);
			})
			.finally(() => {
				console.log('[useApi] DONE fetching data')
				setLoading(false);
			})
	};

	return { loading, data, fetch }
}