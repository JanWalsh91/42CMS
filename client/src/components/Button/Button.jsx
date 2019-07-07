import React from 'react';
import styled from 'styled-components';
import BaseButton from '../Base/BaseButton';


const ThemedButton = styled(BaseButton)`
	border-color: ${props => props.theme.primaryColor}
`;

const Button = props => {
	console.log(props)
	return (
		<ThemedButton onClick={e => props.onClick(e)}>
			{props.children}
		</ThemedButton>
	)
}

export default Button;

// TODO; ThemeProvider in App.jsx