import * as React from 'react';
import { Link } from 'react-router-dom';

export interface Props {
	id: string,
	to: string
};

export class Tab extends React.Component<Props, {}> {
	render() {
		return (
			<li className="Tab" id={this.props.id}>
				<Link to={this.props.to}>{this.props.children}</Link>
			</li>
		)
	}
}