import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { App } from './containers/App';

import { UserContextProvider } from './context/user'; 

ReactDOM.render(
	<BrowserRouter>
		<UserContextProvider>
    		<App />
		</UserContextProvider>
	</BrowserRouter>,
    document.getElementById('app')
);