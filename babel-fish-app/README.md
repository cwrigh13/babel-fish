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

## Firebase Configuration

Update the Firebase configuration in `src/index.js`:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
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