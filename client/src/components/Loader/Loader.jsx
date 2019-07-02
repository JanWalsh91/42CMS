import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../../styles/Loader';

const Loader = () => {
	return (
		<div className='Loader'>
			<FontAwesomeIcon className='Icon' size='5x' icon="circle-notch" spin/>
		</div>
	)
}

export default Loader;