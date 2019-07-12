import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '../Button/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StyledButton = styled(Button)`
	width: 40px;
	display: flex;
    justify-content: center;
	align-items: center;
	padding: 5px;
	border: none;
	border-color: inherit;			
	&:hover {
		border-color: inherit;			
		color: ${props => props.theme.hoverColor};			
	}
	
	/* Make Square */
	&:after {
		content: "";
		display: block;
		padding-bottom: 100%;
	}
`;

const IconButton = props => (
	<StyledButton {...props}>
		<FontAwesomeIcon
			icon={props.icon}
			size={props.size}
		/>
	</StyledButton>
);
	
IconButton.propTypes = {
	icon: PropTypes.function
};

export default IconButton;