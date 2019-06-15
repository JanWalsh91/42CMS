import * as React from 'react';

import '../styles/App';
import { Layout } from '../components/Layout';

export interface Props { };

// 'Props' describes the shape of props.
// State is never set so we use the '{}' type.
export class App extends React.Component<Props, {}> {
    render() {
        return (
			<div className="App">
				<Layout />
			</div>
		)
    }
}