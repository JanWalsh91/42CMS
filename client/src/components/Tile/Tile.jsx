import React from 'react';
import styled, { css } from 'styled-components';

const TileWrapper = styled.div`
	display: inline-block;
	padding: 50px;
	border: ${props => props.theme.thick} ${props => props.theme.primaryColor} solid;
`;

const TileMainContent = styled.div`
	font-family: ${props => props.theme.fontFamily};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: ${props => props.theme.fontSize};
`;

const Tile = props => {
	return (
		<TileWrapper>
			<TileMainContent>
				{props.children}
			</TileMainContent>
		</TileWrapper>
	)
}

export default Tile;