import * as React from 'react';
// import classNames from 'classnames';

import '../styles/Input.scss';

type Element = 'input' | 'submit';
type InputState = 'empty' | 'valid' | 'invalid';

export interface Props {
	id: string,
	element: Element,
	config: any,
	value?: string,
	isValid?: boolean,
	onchange?: Function,
	onClick?: Function
};


export const Input = (props: Props) => {
	
	let inputElement = null;

	switch (props.element) {
		case 'input':
			inputElement = (
				<input
					className="Input"
					{...props.config}
					value={props.value}
					onChange={props.onchange}
				/>
			)
			break;
		case 'submit':
			inputElement = (
			<input
				className="Input"
				{...props.config}
				onClick={props.onClick}
			/>
			)
			break;
		default:
			break;
	}

	return inputElement;
}