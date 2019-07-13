import React, { useState, useContext, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../pages/Login/LoginPage';
import Home from '../pages/Home';
import Projects from '../pages/Projects/ProjectsPage';
import Loader from '../components/Loader/Loader';

import { UserContext } from '../context/user'; 

// font awesome
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faCircleNotch, coffee } from '@fortawesome/free-solid-svg-icons';
// library.add(faCircleNotch, coffee);
// font awesome END

import '../styles/App';

// import UserContext from '../context/user';

const App = () => {

	const userContext = useContext(UserContext);

	useEffect(() => {
		console.log('[App.onEffect]', userContext)
		userContext.auth({});
	}, [])

	const loader = userContext.loading ? <Loader /> : null
	const redirect = (!userContext.loading && !userContext.user) ? <Redirect to='/login'/> : <Redirect to='/projects'/>;
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