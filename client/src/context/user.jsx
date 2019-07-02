import React, { useState, createContext } from 'react';

import useApi from '../hooks/useApi';

const WITH_SERVER = true;

export const UserContext = createContext({
	user: null,
	loading: false,
	auth: () => {},
	login: () => {},
	logout: () => {},
	create: () => {}
});

export const UserContextProvider = props => {
	
	const { fetch } = useApi('post', 'login');

	const [state, setState] = useState({
		user: null,
		loading: false,

		auth: async () => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.auth]')
			// TODO: authenticate with server

			setState({...state, loading: false})
		},

		login: async ({name, password}) => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.login]')
			if (!WITH_SERVER) {
				UserContext.user = true;
			} else {
				await fetch('post', '/login', {name, password});
				setState({...state, user: {name: 'test'}})
			}
			setState({...state, loading: false})
		},

		logout: async () => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.logout]')
			// TODO: test with server to remove cookies

			setState({...state, loading: false})
		},

		create: async ({name, password, projectName}) => {
			setState({...state, loading: true})
			await fetch('post', '/login', {name, password, projectName});
			setState({...state, loading: false})
		}

	})

	return (
		<UserContext.Provider value={{...state}}>
			{props.children}
		</UserContext.Provider>
	)
}