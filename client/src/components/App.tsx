import * as React from 'react';
import './App.scss';

export interface Props { }

// 'Props' describes the shape of props.
// State is never set so we use the '{}' type.
export class App extends React.Component<Props, {}> {
    render() {
        return (
			<h1 className="App">
				Hello 
			</h1>
		)
    }
}