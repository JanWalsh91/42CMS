import * as React from 'react';
import { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import '../styles/Layout.scss';
import { Login } from '../containers/Login';
import { Home } from '../containers/Home';

import UserContext from '../context/user';

export interface Props { };
export interface State {
	isLoading: boolean
	isAuthorized: boolean
}

export class Layout extends React.Component<Props, State> {
	
	static contextType = UserContext
	
	constructor(props: Props) {
		super(props)
		this.state = {
			isLoading: true,
			isAuthorized: false
		};
	}

	componentDidMount() {
		console.log('[Layout.componentDidMount]', this.context)

		// this.setState({isAuthorized: this.context.isLoggedIn, isLoading: false});
	}


    render() {
		const loader = this.state.isLoading ? (<div>loading ...</div>) : null
		const redirect = this.state.isAuthorized ? null : <Redirect to='./signin'/>
		const router =
		<>
			{redirect}
			<Switch>
				<Route path={['/signup', '/signin']} render={(props) => <Login {...props}/>} />
				<Route path='/' render={(props) => <Home {...props}/>} />
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