import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { HelloWorld } from './HelloWorld';

describe('HelloWorld', () => {
  it('renders default greeting', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders custom greeting', () => {
    render(<HelloWorld who="React" />);
    expect(screen.getByText('Hello React')).toBeInTheDocument();
  });
});
