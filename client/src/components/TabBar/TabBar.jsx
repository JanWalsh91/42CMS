import React from 'react';

import Tab from './Tab';

import '../../styles/TabBar';

const TabBar = (props) => {
	return (
		<nav className='TabBar'>
			{props.tabs.map(tab => (
				<Tab tabKey={tab.tabKey}
					key={tab.tabKey}
					active={tab.tabKey == props.activeTabKey}
					onClick={props.onTabClick}>
					{tab.title}
				</Tab>))}
		</nav>
	)
}

export default TabBar;