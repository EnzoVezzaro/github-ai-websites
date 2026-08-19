import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Explorer } from '../../src/components/Explorer';

describe('Explorer component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header', () => {
    render(<Explorer />);
    expect(screen.getByText('Github AI Web Forge')).toBeInTheDocument();
  });

  it('shows Edit Mode button', () => {
    render(<Explorer />);
    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  });

  it('lists available projects and layouts', () => {
    render(<Explorer />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('toggles to edit mode', async () => {
    render(<Explorer />);
    const button = screen.getByText('Edit Mode');
    button.click();
    await waitFor(() => {
      expect(screen.getByText('Explorer')).toBeInTheDocument();
    });
  });

  it('toggles back to explorer mode', async () => {
    render(<Explorer />);
    screen.getByText('Edit Mode').click();
    await waitFor(() => {
      expect(screen.getByText('Explorer')).toBeInTheDocument();
    });
    screen.getByText('Explorer').click();
    await waitFor(() => {
      expect(screen.getByText('Edit Mode')).toBeInTheDocument();
    });
  });
});
