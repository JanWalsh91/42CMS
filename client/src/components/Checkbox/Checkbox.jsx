import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const InputLabel = styled.label`
	display: block;
	height: 1rem;
	width: 1rem;
	padding: 0;
	border-width: ${props => props.theme.thick};
	border-style: solid;
	${props => !props.disabled ?
		css`
			border-color: ${props.theme.primaryColor};
			&:hover {
				border-color: ${props.theme.hoverColor};			
			}
			&:active {
				border-color: ${props.theme.activeColor};			
			}
		` :
		css`
			border-color: ${props.theme.disabledColor};
			cursor: default
		`
	}
`;

const Input = styled.input`
	display: none;
`;

const InnerInput = styled.span`
	display: block;
	height: 90%;
	width: 90%;
	position: relative;
	top: 5%;
	left: 5%;
	background-color: ${props => props.active ? props.theme.primaryColor : 'transparent'};
`;

const Checkbox = props => (
	<InputLabel type='checkbox' {...props}>
		<Input type="checkbox"/>
		<InnerInput active={props.active} />
	</InputLabel>
);

export default Checkbox;