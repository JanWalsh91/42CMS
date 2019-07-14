import React, { useState, useContext, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../pages/Login/LoginPage';
import Home from '../pages/Home';
import Projects from '../pages/Projects/ProjectsPage';
import Loader from '../components/Loader/Loader';

import { UserContext } from '../context/userContext'; 

import '../styles/App';

const App = () => {

	const userContext = useContext(UserContext);

	useEffect(() => {
		userContext.auth({});
	}, []);

	const loader = userContext.loading ? <Loader /> : null
	let redirect = null;
	
	if (!userContext.loading && !userContext.user) {
		redirect = <Redirect to='/login'/>
	}
	if (userContext.user) {
		redirect = <Redirect to='/projects'/>
	}

	const router =
	<>
		{redirect}
		<Switch>
			<Route path='/login' component={Login} />
			<Route path='/projects' component={Projects} />
			<Route path='/' render={Home}/>} />
		</Switch>
	</>


	return (
		<div className="App">
			{loader}
			{router}
			is auth: {userContext.user ? 'yes': 'no'}
		</div>
	)
}

export default App;