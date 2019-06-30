import React from 'react';

import '../Button.scss';

export const Button = props => {
	return (
		<button className='Button' onClick={(e) => props.handleClick(e)}>
			{props.text}
		</button>
	)
}