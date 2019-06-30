const WITH_SERVER = false;

import React, { useState, createContext } from 'react';

export const UserContext = createContext({
	user: null,
	loading: false,
	auth: () => {
		console.log('[init.auth]');
		if (WITH_SERVER) {
			UserContext.user = true;
		}
	},
	login: () => {
		if (WITH_SEVRER) {
			UserContext.user = true;
		}
	},
	logout: () => {
		UserContext.user = null;
	}
});

export const UserContextProvider = props => {
	

	const [state, setState] = useState({
		user: 'set',
		loading: false,
		auth: () => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.auth]')

			setState({...state, loading: false})
		},
		login: () => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.login]')
			setState({...state, loading: false})
		},
		logout: () => {
			setState({...state, loading: true})
			console.log('[UserContextProvider.logout]')
			setState({...state, loading: false})
		}
	})
	console.log('[UserContextProvider]', state);
	return (
		<UserContext.Provider value={{...state}}>
			{props.children}
		</UserContext.Provider>
	)
}