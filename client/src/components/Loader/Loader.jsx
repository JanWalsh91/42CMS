import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { circleNotch } from '@fortawesome/free-solid-svg-icons';

import '../../styles/Loader';

const Loader = () => {
	return (
		<div className='Loader'>
			<FontAwesomeIcon className='Icon' size='5x' icon={circleNotch} spin/>
		</div>
	)
}

export default Loader;