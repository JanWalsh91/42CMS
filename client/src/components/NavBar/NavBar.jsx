import React from 'react'
import styled from 'styled-components'

const NavBarWrapper = styled.nav`

	/* Debug */
	border: red dashed 1px;
`

const NavBar = props => (
	<NavBarWrapper>
		NAV BAR
		{props.children}
	</NavBarWrapper>
)

export default NavBar