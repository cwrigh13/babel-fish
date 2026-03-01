# Babel Fish – Task List

## In Progress

### Add More Phrase Suggestions
Add new phrases to the phrasebook across all staff and customer categories. Each phrase requires translations for all 10 supported languages: Mandarin (zh-CN), Cantonese (zh-HK), Nepali (ne-NP), Greek (el-GR), Arabic (ar-SA), Macedonian (mk-MK), Spanish (es-ES), Italian (it-IT), Indonesian (id-ID), and English (en-US).

**Files to update:**
- `babel-fish-app/src/App.jsx` — `initialPhrases` array (compact format, no IDs)
- `babel-fish-app/src/utils/initialPhrases.js` — `initialPhrases` export (verbose format with IDs)

**New phrases to add:**

#### Staff – General Enquiries
- Can I help you?
- Do you understand?
- Please speak slowly.
- I will get someone who can help you.

#### Staff – Transactional
- Your reservation is ready for pickup.
- Would you like to pay by cash or card?
- These items are for reference only and cannot be borrowed.

#### Staff – Digital Services
- Would you like to use a scanner?
- You have limited time remaining on the computer.

#### Customer – General Assistance
- I need help finding a book.
- I lost my library card.
- I forgot my PIN.
- Can I speak to a librarian?

#### Customer – Library Layout
- Where is the reference section?
- Where is the study area?
- Where is the magazine section?

#### Customer – Digital Services
- I would like to book a computer session.
- Can I scan a document?

#### Customer – Language & Community Resources
- Do you have books in other languages?
- Are there any community programs or events at the library?
- Do you have newspapers in other languages?

**Status:** Complete — committed on branch `claude/add-more-suggestions-avaGF`

---

## Backlog

- Add admin interface for managing phrases without code changes
- Add more supported languages (e.g., Vietnamese, Korean, Filipino)
- Add phrase search/filter by keyword
- Add user feedback mechanism for translation quality
