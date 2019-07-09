import React from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import theme from '../client/src/context/theme';

import Button from '../client/src/components/Button/Button.jsx';
import Tile from '../client/src/components/Tile/Tile';
import Checkbox from '../client/src/components/Checkbox/Checkbox';

storiesOf('Basic/Button', module)
	.add('With Text', () => (
		<Button>Click Me</Button>
	));
		
storiesOf('Themed/Button', module)
	.addDecorator(storyFn => (
		<ThemeProvider theme={theme}>
			{storyFn()}
		</ThemeProvider>
	))
	.add('With Text', () => (
		<Button>Click Me</Button>
	))
	.add('Disabled', () => (
		<Button disabled>Click Me</Button>
		))
	.add('With Text', () => (
		<Button>Click Me</Button>
	));


storiesOf('Themed/Tile', module)
	.addDecorator(storyFn => (
		<ThemeProvider theme={theme}>
			{storyFn()}
		</ThemeProvider>
	))
	.add('With Text', () => (
		<Tile>This is the tile contents</Tile>
	));

storiesOf('Themed/Checkbox', module)
	.addDecorator(storyFn => (
		<ThemeProvider theme={theme}>
			{storyFn()}
		</ThemeProvider>
	))
	.add('Inactive', () => (
		<Checkbox />
	))
	.add('Active', () => (
		<Checkbox active/>
	))
	.add('With label', () => (
		<Checkbox active label='Use this State'/>
	))