import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../../styles/Loader';

export default () => {
	return (
		<div className='Loader'>
			<FontAwesomeIcon classname='Icon' size='5x' icon="circle-notch" spin/>
		</div>
	)
}