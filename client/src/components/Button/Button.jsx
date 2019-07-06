import React from 'react';

import './Button.scss';

const Button = props => {
	return (
		<button className='Button' onClick={(e) => props.handleClick(e)}>
			{props.children}
		</button>
	)
}

export default Button;