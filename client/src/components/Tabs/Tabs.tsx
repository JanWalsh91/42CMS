import * as React from 'react';

export interface Props { 
	activeTabId: string
};

export class Tabs extends React.Component<Props, {}> {
	render() {
		return <nav className='Tabs'>
			{this.props.children}
		</nav>
	}
}

