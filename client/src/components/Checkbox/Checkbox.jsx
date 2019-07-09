import React from 'react';
import styled, { css } from 'styled-components';

const InputLabel = styled.label`
	padding: ${props => props.theme.thick};
	display: inline-flex;
	position: relative;
	align-items: center;
	font-family: ${props => props.theme.fontFamily}
	${props => !props.disabled ?
		css`
			cursor: pointer;
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
`;

const InputButton = styled.div`
	display: inline-block;
	position: relative;
	height: 1rem;
	width: 1rem;
	border-width: ${props => props.theme.thin};
	border-style: solid;
	border-color: inherit;

	&:after {
		content: "";
		position: absolute;
		top: ${props => props.theme.thin};
		left: ${props => props.theme.thin};
		right: ${props => props.theme.thin};
		bottom: ${props => props.theme.thin};
		background-color: ${props => props.active ? props.theme.primaryColor : 'transparent'};
	}
`;

const Input = styled.input`
	display: none;
`;

const InputText = styled.span`
	margin-left: 10px;
`;

const Checkbox = props => (
	<InputLabel>
		<Input type="checkbox"/>
		<InputButton {...props} />
		{props.label ? <InputText>{props.label}</InputText> : null}
	</InputLabel>
);

export default Checkbox;