import React, { useState, createContext } from 'react';

import useApi from '../hooks/useApi';

export const UserContext = createContext({
	user: null,
	loading: false,
	error: null,
	auth: () => {},
	login: () => {},
	logout: () => {},
	create: () => {}
});

export const UserContextProvider = props => {
	
	const login = useApi('post', 'login');
	const logout = useApi('post', 'logout');
	const create = useApi('post', 'users');
	const auth = useApi('get', 'auth');

	const [state, setState] = useState({
		user: null,
		loading: false,
		error: null,

		auth: async () => {
			setState({...state, loading: true})
			console.log('%c[UserContextProvider.auth]', 'color: magenta')
			try {
				let ret = await auth({});
				setState({...state, user: ret, loading: false})
				console.log('%c[UserContextProvider.auth] SUCCESS', 'color: green')
			} catch (e) {
				console.log('%c[UserContextProvider.auth] FAIL', 'color: red')
				setState({...state, loading: false})
			}
		},

		login: async ({username, password}) => {
			setState({...state, loading: true})
			console.log('%c[UserContextProvider.login]', 'color: magenta')
			try {
				await login({body: {username, password}});
				setState({...state, user: {username}, loading: false})
				console.log('%c[UserContextProvider.login] SUCCESS', 'color: green')
			} catch (e) {
				setState({...state, error: 'FAIL', loading: false});
				console.log('%c[UserContextProvider.login] FAIL', 'color: red')
			}
		},

		logout: async () => {
			setState({...state, loading: true})
			console.log('%c[UserContextProvider.logout]', 'color: magenta')
			try {
				await logout({});
				setState({...state, user: null, loading: false})				
				console.log('%c[UserContextProvider.logout] SUCCESS', 'color: green')
			} catch (e) {
				setState({...state, loading: false})				
				console.log('%c[UserContextProvider.logout] FAIL', 'color: red')
			}
		},

		create: async ({username, password, projectName, name}) => {
			console.log('%c[UserContextProvider.create]', 'color: magenta')
			setState({...state, loading: true})
			try {
				const ret = await create({body: {username, password, projectName, name}});
				console.log('%c[UserContextProvider.create] SUCCESS', 'color: green')
				setState({...state, user: ret.user, loading: false});
			} catch (e) {
				console.log('%c[UserContextProvider.create] FAIL', 'color: red')
				setState({...state, error: e.message, loading: false});
			}
		}

	})

	return (
		<UserContext.Provider value={{...state}}>
			{props.children}
		</UserContext.Provider>
	)
}