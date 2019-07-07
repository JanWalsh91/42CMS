import React from 'react';
import styled, { css } from 'styled-components';
import BaseButton from '../Base/BaseButton';

const StyledButton = styled(BaseButton)`
	${props => !props.disabled ?
		css`
			border-color: ${props.theme.primaryColor};
			color: ${props.theme.primaryColor};
			&:hover {
				border-color: ${props.theme.hoverColor};			
				color: ${props.theme.hoverColor};			
			}
			&:active {
				border-color: ${props.theme.activeColor};			
				color: ${props.theme.activeColor};			
			}
		` :
		css`
			border-color: ${props.theme.disabledColor};
			cursor: default
		`
	}
	border-width: ${props => props.theme.thick};
	font-family: ${props => props.theme.fontFamily};
	font-size: ${props => props.theme.fontSize};
`;

const Button = props => <StyledButton {...props} />

export default Button;