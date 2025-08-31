import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HelloWorld } from './index';

describe('library entry (src/index.ts)', () => {
  it('re-exports HelloWorld', () => {
    render(<HelloWorld who="Library" />);
    expect(screen.getByText('Hello Library')).toBeInTheDocument();
  });
});

