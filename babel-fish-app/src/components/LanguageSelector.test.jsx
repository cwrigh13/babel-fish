import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from './LanguageSelector';
import { LANGUAGE_CODES } from '../utils/constants';

const defaultProps = {
  selectedLanguage: 'English',
  onLanguageChange: vi.fn(),
  mode: 'staff',
};

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a button for every language in LANGUAGE_CODES', () => {
    render(<LanguageSelector {...defaultProps} />);
    const languages = Object.keys(LANGUAGE_CODES);
    languages.forEach((lang) => {
      const nativeName = LANGUAGE_CODES[lang].nativeName;
      expect(screen.getByText(nativeName)).toBeInTheDocument();
    });
  });

  it('displays the staff-specific heading when mode is staff', () => {
    render(<LanguageSelector {...defaultProps} mode="staff" />);
    expect(screen.getByText(/Staff Communication/i)).toBeInTheDocument();
  });

  it('displays the customer-specific heading when mode is customer', () => {
    render(<LanguageSelector {...defaultProps} mode="customer" />);
    expect(screen.getByText(/Customer Communication/i)).toBeInTheDocument();
  });

  it('calls onLanguageChange with the clicked language name', () => {
    const onLanguageChange = vi.fn();
    render(<LanguageSelector {...defaultProps} onLanguageChange={onLanguageChange} />);

    fireEvent.click(screen.getByText(LANGUAGE_CODES.Mandarin.nativeName));

    expect(onLanguageChange).toHaveBeenCalledWith('Mandarin');
  });

  it('calls onLanguageChange with the correct name for Arabic', () => {
    const onLanguageChange = vi.fn();
    render(<LanguageSelector {...defaultProps} onLanguageChange={onLanguageChange} />);

    fireEvent.click(screen.getByText(LANGUAGE_CODES.Arabic.nativeName));

    expect(onLanguageChange).toHaveBeenCalledWith('Arabic');
  });

  it('renders exactly 10 language buttons', () => {
    render(<LanguageSelector {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });
});
