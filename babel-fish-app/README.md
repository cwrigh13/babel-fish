# Babel Fish - Library Assistant App

A React application for library staff and customer assistance with multi-language support and speech recognition.

## Features

- **Multi-language Support**: Supports 10 languages including Mandarin, Cantonese, Nepali, Greek, Arabic, and more
- **Speech Recognition**: Real-time speech-to-text functionality
- **Speech Synthesis**: Text-to-speech with language-specific voices
- **Firebase Integration**: Conversation logging and user authentication
- **Interactive UI**: Staff and customer-specific interfaces
- **Directions Integration**: Google Maps integration for Centrelink directions

## Setup

1. **Install Dependencies**:
   ```bash
   cd babel-fish-app
   npm install
   ```

2. **Configure Firebase**:
   - Update the Firebase configuration in `src/index.js`
   - Replace the placeholder values with your actual Firebase project credentials
   - Enable Firestore in your Firebase console

3. **Start the Development Server**:
   ```bash
   npm start
   ```

## Usage

1. **Select Language**: Choose your preferred language from the dropdown
2. **Choose User Type**: Select either "Staff" or "Customer"
3. **Select Category**: Choose from available categories based on your user type
4. **Use Speech Features**:
   - Click "Start Listening" to begin speech recognition
   - Click "Speak" to hear text-to-speech
   - View transcriptions in real-time

## Security Configuration

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your actual API keys and configuration:
   ```bash
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your_app_id

   # Google APIs
   REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

   # Security Configuration
   REACT_APP_MAX_REQUESTS_PER_MINUTE=60
   REACT_APP_ENABLE_HTTPS_ENFORCEMENT=true
   REACT_APP_ENABLE_RATE_LIMITING=true
   ```

### Security Features

The app now includes the following security measures:

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **HTTPS Enforcement**: Automatic redirect to HTTPS in production
- **XSS Protection**: Input sanitization prevents cross-site scripting
- **API Security**: Payloads are sanitized before sending to external APIs
- **Error Handling**: Secure error messages that don't leak sensitive information

### Firebase Configuration

The Firebase configuration is now managed through environment variables in `src/index.js`:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ""
});
```

## Supported Languages

- English (en-US)
- Mandarin (zh-CN)
- Cantonese (zh-HK)
- Nepali (ne-NP)
- Greek (el-GR)
- Arabic (ar-SA)
- Macedonian (mk-MK)
- Spanish (es-ES)
- Italian (it-IT)
- Indonesian (id-ID)

## Technologies Used

- React 18
- Firebase (Authentication & Firestore)
- Web Speech API
- Google Maps Embed API

## Development

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Browser Compatibility

This app requires a modern browser with support for:
- Web Speech API (SpeechRecognition & SpeechSynthesis)
- ES6+ JavaScript features
- React 18

## License

This project is for educational and demonstration purposes.
