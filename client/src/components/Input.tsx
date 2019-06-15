import * as React from 'react';
import './Input.scss';

export interface Props { };

export class Input extends React.Component<Props, {}> {
	render() {
		return (
			<div className="Input">
				My Input
			</div>
		);
	}
}