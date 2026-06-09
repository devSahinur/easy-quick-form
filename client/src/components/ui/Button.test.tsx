import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('is disabled while loading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'bg-destructive',
    );
  });
});
