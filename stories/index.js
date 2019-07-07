import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '../client/src/components/Button/Button.jsx';
import { ThemeProvider } from 'styled-components';
import theme from '../client/src/context/theme';

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