import * as React from 'react';

import '../styles/Button.scss';

export interface Props { text: string, handleClick: (e: any) => any };

export class Button extends React.Component<Props, {}> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<button className='Button' onClick={(e) => this.props.handleClick(e)}>
				{this.props.text}
			</button>
		)
	}
};