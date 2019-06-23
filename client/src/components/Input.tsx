import * as React from 'react';
import classNames from 'classnames';

import '../styles/Input.scss';

type Element = 'input' | 'submit';
type InputState = 'empty' | 'valid' | 'invalid';

export interface Props {
	id: string,
	element: Element,
	config: any,
	value?: string,
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void,
	onClick?: (e: React.FormEvent<HTMLInputElement>) => void,
	onBlur?: (e: React.FormEvent<HTMLInputElement>) => void,
	touched?: boolean,
	dirty?: boolean,
	valid?: boolean
};


export const Input = (props: Props) => {
	
	let inputElement = null;

	switch (props.element) {
		case 'input':
			inputElement = (
				<input
					className={classNames('Input', {touched: props.touched, dirty: props.dirty, invalid: !props.valid})}
					{...props.config}
					value={props.value}
					onChange={props.onChange}
					onBlur={props.onBlur}
				/>
			)
			break;
		default:
			break;
	}

	return inputElement;
}