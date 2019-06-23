import * as React from 'react';

import { Tab } from './Tab';

import '../../styles/TabBar';

export interface Props { 
	activeTabKey: string,
	onTabClick: (tabKey: string) => any,
	tabs: {tabKey: string, title: string}[]
};

class TabBar extends React.Component<Props, {}> {
	render() {
		return (
			<nav className='TabBar'>
				{this.props.tabs.map(tab => (
					<Tab tabKey={tab.tabKey}
						key={tab.tabKey}
						active={tab.tabKey == this.props.activeTabKey}
						onClick={this.props.onTabClick}>
						{tab.title}
					</Tab>))}
			</nav>
		)
	}
}

export { TabBar }