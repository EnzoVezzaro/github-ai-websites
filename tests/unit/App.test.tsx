import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '../../src/context/SettingsContext';
import { Explorer } from '../../src/components/Explorer';

function renderWithProviders(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the app with settings provider', () => {
    renderWithProviders(<Explorer />);
    expect(screen.getByText('Github AI Web Forge')).toBeInTheDocument();
  });

  it('has content and layout sections', () => {
    renderWithProviders(<Explorer />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('has preview area', () => {
    renderWithProviders(<Explorer />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
  });
});
