import * as React from 'react';

export interface Props { text: string, handleClick: () => any }

export class Button extends React.Component<Props, {}> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<button onClick={() => this.props.handleClick}>
				{this.props.text}
			</button>
		)
	}
}