import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import '../../styles/Loader';

const Loader = () => {
	return (
		<div className='Loader'>
			<FontAwesomeIcon className='Icon' size='5x' icon={faCircleNotch} spin/>
		</div>
	)
}

export default Loader;