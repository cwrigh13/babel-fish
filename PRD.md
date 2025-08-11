Product Requirements Document: Georges River Libraries Babel Fish
This document outlines the comprehensive requirements for the "Georges River Libraries Babel Fish" web application. It is structured to serve as a detailed guide for development, ensuring all features, functionalities, and technical considerations are clearly defined.

1. Introduction
Product Name: Georges River Libraries Babel Fish

Purpose: The Georges River Libraries Babel Fish is a web-based application designed to facilitate multilingual communication between library staff and customers. It serves as a digital phrasebook, providing instant translations and audio playback of common library-related phrases, aiming to improve accessibility and service quality for diverse community members.

Goals:

To bridge language barriers between library staff and non-English speaking customers.

To empower library staff with a tool for quick and accurate communication in key scenarios.

To provide customers with essential information in their preferred language.

To enhance the overall customer experience at Georges River Libraries.

To offer a scalable and extensible platform for future language and feature additions.

2. User Stories & Features
The application supports two primary user roles: Staff and Customer, each with distinct needs and functionalities.

2.1. Staff User Stories
As a Library Staff Member, I want to:

Select my display language (e.g., Mandarin, Cantonese, Nepali, Greek, Arabic, Macedonian, Spanish, Italian, Indonesian) so I can navigate the app comfortably. The "English" option should not be available for staff language selection.

Toggle between "For Staff" and "For Customers" modes so I can access phrases relevant to my role or to assist a customer.

Filter phrases by category (e.g., General Enquiries, Transactional, Digital Services) so I can quickly find the relevant phrase.

See an English phrase and its translation in the selected staff language, with the translated text being text-lg font-semibold and the English text text-base font-medium, so I know what I am communicating and it's easy to read.

Play the audio of the translated phrase so the customer can hear it clearly.

Access specific "I speak..." phrases (e.g., "I speak Mandarin.", "I speak Cantonese.") from a pop-up when I click "Do you prefer to speak Mandarin or Cantonese?", so I can easily indicate my language ability to a customer.

Specific Requirement (Main Card Display): The English text on the main "Do you prefer to speak Mandarin or Cantonese?" card should dynamically reorder to "Do you prefer to speak Cantonese or Mandarin?" if the staffLanguage is 'Cantonese'. Otherwise, it should remain "Do you prefer to speak Mandarin or Cantonese?".

Specific Requirement (Pop-up Order): Within the pop-up, if staffLanguage is 'Cantonese', "I speak Cantonese." should be listed first, followed by "I speak Mandarin.". For all other staffLanguage selections, "I speak Mandarin." should be listed first, followed by "I speak Cantonese.".

Specific Requirement (Pop-up Translations/Audio):

"I speak Mandarin." should always display its Mandarin (zh-CN) translation (我会说普通话。) and be spoken in Mandarin (zh-CN), regardless of the staffLanguage.

"I speak Cantonese." should always display its Cantonese (zh-HK) translation (我識講廣東話。) and be spoken in Cantonese (zh-HK), regardless of the staffLanguage.

Input a custom query and get AI-suggested library phrases and their Simplified Chinese translations so I can handle less common interactions.

2.2. Customer User Stories
As a Library Customer, I want to:

Select my preferred language (e.g., Mandarin, Cantonese, Nepali, Greek, Arabic, Macedonian, Spanish, Italian, Indonesian) so I can understand the phrases. The "English" option should not be available for customer language selection.

See a phrase in my selected language and its English equivalent, with the translated text being text-lg font-semibold and the English text text-base font-medium, so I can understand what the staff member is saying and it's easy to read.

Play the audio of the English phrase so I can hear the correct pronunciation from the staff.

Filter phrases by category (e.g., General Assistance, Transactional, Library Layout, Language & Community Resources, Digital Services) so I can quickly find relevant questions or statements.

Access a pop-up with a Google Map and QR code for directions to Centrelink when I click the "How do I get to Centrelink?" card, so I can easily navigate there. The QR code prompt text should be text-sm and mediumGrey.

3. User Flows
3.1. Main Application Flow
User opens the Babel Fish app.

User chooses "For Staff" or "For Customers" mode.

If "For Staff":

Staff selects their preferred display language (excluding English).

Staff selects a category filter (All, General Enquiries, Transactional, Digital Services).

Staff browses phrases:

If the phrase is "Do you prefer to speak Mandarin or Cantonese?", clicking it opens a pop-up.

For other phrases, clicking plays the audio.

Staff can input a custom query to get AI suggestions.

If "For Customers":

Customer selects their preferred language (excluding English).

Customer selects a category filter (All, General Assistance, Transactional, Library Layout, Language & Community Resources, Digital Services).

Customer browses phrases:

If the phrase is "How do I get to Centrelink?", clicking it opens a QR code/map pop-up.

For other phrases, clicking plays the audio.

3.2. "I Speak..." Pop-up Flow (Staff Mode, General Enquiries Category)
Staff is in "For Staff" mode and has "General Enquiries" selected.

Staff clicks on the "Do you prefer to speak Mandarin or Cantonese?" card.

A pop-up titled "I Speak..." appears.

Inside the pop-up, the list of options ("I speak Mandarin.", "I speak Cantonese.") is ordered based on the staffLanguage:

If staffLanguage is 'Cantonese': "I speak Cantonese." is listed first, followed by "I speak Mandarin.".

Otherwise (if staffLanguage is 'Mandarin', or any other language): "I speak Mandarin." is listed first, followed by "I speak Cantonese.".

Clicking on "I speak Mandarin." plays the Mandarin audio (zh-CN) and displays its Mandarin translation (我会说普通话。). The pop-up closes.

Clicking on "I speak Cantonese." plays the Cantonese audio (zh-HK) and displays its Cantonese translation (我識講廣東話。). The pop-up closes.

Clicking the 'x' button or outside the pop-up closes it.

3.3. Centrelink QR Code & Map Pop-up Flow (Customer Mode, Library Layout Category)
Customer is in "For Customers" mode and has "Library Layout" selected.

Customer clicks on the "How do I get to Centrelink?" card.

A pop-up titled "Directions to Centrelink" appears.

The pop-up displays an embedded Google Map showing directions from Hurstville Library to Centrelink Hurstville.

The pop-up also displays a QR code that users can scan with their phone to open these directions directly in the Google Maps app.

Clicking the 'x' button or outside the pop-up closes it.

4. Technical Requirements & Considerations
Frontend:

Framework: Vanilla JavaScript (ES6+ with modern DOM APIs).

Styling: Tailwind CSS (utility-first approach).

State Management: Vanilla JavaScript with traditional DOM manipulation and event handling.

Data Storage: Firebase Firestore (client SDK for phrases data).

Authentication: Firebase Authentication (anonymous and custom token sign-in).

Speech Synthesis: Browser's native SpeechSynthesisUtterance API.

External API (LLM): Integration with Google's gemini-2.0-flash:generateContent API for suggested phrases (client-side fetch call).

External API (QR Code): api.qrserver.com for QR code generation.

External API (Maps Embed): Google Maps Embed API for displaying the map within an iframe.

Responsiveness: Fully responsive design ensuring optimal viewing and usability on all devices (mobile, tablet, desktop) and orientations.

Readability: All translated text (text-lg font-semibold) must be visibly larger than its English equivalent (text-base font-medium). QR code prompt text should be text-sm and mediumGrey.

Logo: The logo image (https://georgesriver.spydus.com/api/maintenance/1.0/imagebrowser/image?blobName=a31cf63f-7e24-41d5-b1f8-c206bde45ce6.png) must be displayed within a rounded box with a darkTeal background (brandColors.darkTeal) and p-6 padding.

No Filipino/Tagalog: All references and options for "Filipino/Tagalog" must be removed.

No User ID Display: The User ID display should be removed from the UI.

Backend (Node.js/Express):

Framework: Node.js with Express.

Firebase Admin SDK: Initialized for potential future server-side Firebase operations (e.g., data validation, user management, cloud functions).

CORS: Configured to allow cross-origin requests from the vanilla JavaScript frontend.

Environment Variables: Uses dotenv to load sensitive API keys and configurations from .env files.

Data Structure (Firestore - initialPhrases hardcoded for seeding):

A Firestore collection named artifacts/{appId}/public/data/phrases will store phrase documents.

Each phrase document will have:

type: 'staff' or 'customer'

category: String matching defined categories:

Staff: 'General Enquiries', 'Transactional', 'Digital Services'

Customer: 'General Assistance', 'Transactional', 'Library Layout', 'Language & Community Resources', 'Digital Services'

english: The English text of the phrase.

translations: An object where keys are BCP-47 language codes (e.g., 'zh-CN', 'zh-HK', 'ne-NP', 'en-US') and values are the translated strings. All translations objects must include an 'en-US' key.

5. Future Enhancements (Potential Features)
User-Contributed Phrases: Allow staff to add new phrases and translations directly through the UI (requires backend API to save to Firestore).

Phrase Search/Filtering: Implement a search bar for quick lookup of phrases.

Offline Mode: Cache phrases locally for use without an internet connection.

More Languages: Expand the list of supported languages.

Analytics: Track usage of phrases and languages to identify common needs.

Admin Panel: A dedicated interface for managing phrases and users.

User Feedback: Allow users to provide feedback on translation accuracy.

Speech-to-Text Input: Allow staff to speak a phrase and have it translated.

Integrated Google Maps API Key: For production, obtain and securely use a Google Maps API key for the Embed API.