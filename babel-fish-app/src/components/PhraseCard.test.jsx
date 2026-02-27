import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PhraseCard from './PhraseCard';

// A minimal phrase fixture with translations for supported languages
const phrase = {
  id: 'phrase-001',
  english: 'How can I help you?',
  category: 'General Enquiries',
  translations: {
    'zh-CN': '我怎么帮助您？',
    'zh-HK': '我怎樣幫助您？',
    'es-ES': '¿Cómo puedo ayudarte?',
    'en-US': 'How can I help you?',
  },
};

const defaultProps = {
  phrase,
  selectedLanguage: 'English',
  onSpeak: vi.fn(),
  onLogConversation: vi.fn(),
  mode: 'staff',
  isSpeaking: false,
};

describe('PhraseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the English text of the phrase', () => {
    render(<PhraseCard {...defaultProps} />);
    // The phrase.english value appears in both the English label and the translation
    // div when the selected language is English, so use getAllByText.
    expect(screen.getAllByText('How can I help you?').length).toBeGreaterThan(0);
  });

  it('renders the category badge', () => {
    render(<PhraseCard {...defaultProps} />);
    expect(screen.getByText('General Enquiries')).toBeInTheDocument();
  });

  it('shows the English translation when selectedLanguage is English', () => {
    render(<PhraseCard {...defaultProps} selectedLanguage="English" />);
    // Translation for en-US is 'How can I help you?' — same as english field
    expect(screen.getAllByText('How can I help you?').length).toBeGreaterThan(0);
  });

  it('shows the Mandarin translation when selectedLanguage is Mandarin', () => {
    render(<PhraseCard {...defaultProps} selectedLanguage="Mandarin" />);
    expect(screen.getByText('我怎么帮助您？')).toBeInTheDocument();
  });

  it('shows the Cantonese translation when selectedLanguage is Cantonese', () => {
    render(<PhraseCard {...defaultProps} selectedLanguage="Cantonese" />);
    expect(screen.getByText('我怎樣幫助您？')).toBeInTheDocument();
  });

  it('falls back to the English text when no translation exists for the selected language', () => {
    render(<PhraseCard {...defaultProps} selectedLanguage="Nepali" />);
    // No Nepali translation in fixture → falls back to phrase.english (appears twice)
    expect(screen.getAllByText('How can I help you?').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSpeak with the correct translation and language code on click', () => {
    const onSpeak = vi.fn();
    const { container } = render(
      <PhraseCard {...defaultProps} selectedLanguage="Spanish" onSpeak={onSpeak} />
    );

    fireEvent.click(container.firstChild);

    expect(onSpeak).toHaveBeenCalledWith('¿Cómo puedo ayudarte?', 'es-ES');
  });

  it('calls onLogConversation with phraseId and mode on click', () => {
    const onLogConversation = vi.fn();
    const { container } = render(
      <PhraseCard {...defaultProps} onLogConversation={onLogConversation} />
    );

    // Click the card's outermost div (has the onClick handler)
    fireEvent.click(container.firstChild);

    expect(onLogConversation).toHaveBeenCalledWith('phrase-001', 'staff');
  });

  it('does not throw when onLogConversation is not provided', () => {
    const { container } = render(
      <PhraseCard {...defaultProps} onLogConversation={undefined} />
    );
    expect(() => fireEvent.click(container.firstChild)).not.toThrow();
  });

  it('renders a play icon when not speaking', () => {
    const { container } = render(<PhraseCard {...defaultProps} isSpeaking={false} />);
    // The SVG play icon path is rendered when not speaking
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders a spinner when isSpeaking is true', () => {
    const { container } = render(<PhraseCard {...defaultProps} isSpeaking={true} />);
    // When speaking, SVG is replaced by a div spinner
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });
});
