import * as React from 'react';

export interface Props {
	tabKey: string,
	active: boolean,
	onClick?: (tabKey: string) => any,
};

export class Tab extends React.Component<Props, {}> {
	render() {
		return (
			<li className={`Tab${this.props.active ? ' active' : ''}`}
				onClick={(() => this.props.onClick(this.props.tabKey))}>
				<span>
					{this.props.children}
				</span>
			</li>
		)
	}
}