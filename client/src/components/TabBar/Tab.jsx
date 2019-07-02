import React from 'react';

const Tab = (props) => {
		return (
			<li className={`Tab${props.active ? ' active' : ''}`}
				onClick={(() => props.onClick(props.tabKey))}>
				<span>
					{props.children}
				</span>
			</li>
		)
}

export default Tab;