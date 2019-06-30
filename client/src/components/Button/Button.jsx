import React from 'react';

import '../Button.scss';

const Button = props => {
	return (
		<button className='Button' onClick={(e) => props.handleClick(e)}>
			{props.text}
		</button>
	)
}

export default Button;