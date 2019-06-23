import * as React from 'react';

import '../styles/App';
import { Layout } from '../components/Layout';

import UserContext from '../context/user';

import api from '../utils/api';

export interface Props { };

export interface State {
	user?: any
};

export class App extends React.Component<Props, {}> {

	constructor(props: Props) {
		super(props);
		this.state = {
			user: null
		}
	}

	async login() {
		console.log('[App.login]')
		// api.get('/login')
	}

	async logout() {
		console.log('[App.logout]')
		// TODO: remove cookie
	}

	async auth() {
		console.log('[App.auth]')

	}

	render() {
		return (
			<UserContext.Provider value={{
				...this.state,
				login: this.login,
				logout: this.logout,
				auth: this.auth,
			}}>
				<div className="App">
					<Layout />
				</div>
			</UserContext.Provider>
		)
	}
}