import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const SelectWrapper = styled.div`
	border: 1px solid black;
	height: 50px;
	width: 150px;
	&:hover {
		cursor: pointer;
	}
`;

const OptionList = styled.ul`
	${props => props.showDropdown ?
		css`
			visibility: visible;
		` :
		css`
			visibility: hidden;
		`
	}
`;

const Option = styled.li`
	&:hover {
		cursor: pointer;
	}
`;

const Select = props => {

	const [showDropdown, setShowDropdown] = useState(false);
	const [value, setValue] = useState(props.defaultValue)

	let options = null;
	if (props.options) {
		options = (
			<OptionList showDropdown={showDropdown}>
				{props.options.map(option => (
					<Option key={option.value}>
						{option.label}
					</Option>
				))}
			</OptionList>
		)
	}
	
	const onDropdownClick = () => setShowDropdown(!showDropdown);

	return (
		<>
			<SelectWrapper {...props} onClick={onDropdownClick}>
				Click me
			</SelectWrapper>
			{options}
		</>
	);
}


export default Select;