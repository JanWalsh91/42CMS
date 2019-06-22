import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import '../styles/Layout.scss';
import { Login } from '../containers/Login';
import { Home } from '../containers/Home';
import { isAuth } from '../utils/auth'
import { isMainThread } from 'worker_threads';

export interface Props { };
export interface State {
	isLoading: boolean
	isAuthorized: boolean
}

export class Layout extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			isLoading: true,
			isAuthorized: false
		};
	}

	componentDidMount() {
		isAuth().then(res => {
			console.log('is auth');
			this.setState({isAuthorized: res, isLoading: false});
		}).catch(res => {
			console.log('is NOT auth');
			this.setState({isAuthorized: false, isLoading: false});
		});
	}

    render() {
		const loader = this.state.isLoading ? (<div>loading ...</div>) : null
		const redirect = this.state.isAuthorized ? null : <Redirect to='./Login'/>
		const router = 
		<>
			{redirect}
			<Switch>
				<Route path='/login' component={Login} />
				<Route path='/' component={Home} />
			</Switch>
		</>

		return (
			<div className="Layout">
				{loader || router}
				is auth: {this.state.isAuthorized ? 'y': 'n'}

			</div>
		)
    }
}