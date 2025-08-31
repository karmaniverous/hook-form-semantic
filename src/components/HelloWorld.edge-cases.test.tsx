import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HelloWorld } from './HelloWorld';

describe('HelloWorld edge cases', () => {
  it('respects empty string (no defaulting)', () => {
    render(<HelloWorld who="" />);
    expect(screen.getByText('Hello ')).toBeInTheDocument();
  });

  it('renders falsy-but-defined values', () => {
    render(<HelloWorld who={'0'} />);
    expect(screen.getByText('Hello 0')).toBeInTheDocument();
  });

  it('renders emoji and unicode', () => {
    render(<HelloWorld who="🚀" />);
    expect(screen.getByText('Hello 🚀')).toBeInTheDocument();
  });
});

