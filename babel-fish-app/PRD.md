# Product Requirements Document (PRD)
# Babel Fish - Library Assistant App

## 1. Executive Summary

### 1.1 Product Overview
Babel Fish is a React-based web application designed to facilitate communication between library staff and customers who speak different languages. The app provides real-time speech recognition, text-to-speech capabilities, and AI-powered phrase suggestions to bridge language barriers in library settings.

### 1.2 Problem Statement
Library staff often encounter customers who speak languages other than English, creating communication barriers that can prevent effective service delivery. Traditional translation services are often unavailable or impractical for real-time library interactions.

### 1.3 Solution
A web-based application that provides:
- Multi-language phrase library with audio playback
- Real-time speech recognition and synthesis
- AI-powered phrase suggestions
- User-specific interfaces for staff and customers
- Integration with external services (Google Maps, Firebase)

### 1.4 Target Users
- **Primary**: Library staff at Georges River Libraries
- **Secondary**: Library customers who speak languages other than English
- **Tertiary**: Other library systems seeking similar solutions

## 2. Product Goals & Success Metrics

### 2.1 Primary Goals
- Reduce communication barriers between library staff and non-English speaking customers
- Improve customer service quality and efficiency
- Provide immediate access to commonly needed phrases in multiple languages
- Enable real-time speech interaction in library settings

### 2.2 Success Metrics
- **Adoption Rate**: Number of staff using the app daily/weekly
- **Usage Frequency**: Average sessions per day/week
- **Customer Satisfaction**: Feedback from staff and customers
- **Communication Effectiveness**: Reduction in communication-related incidents
- **Response Time**: Time to find and use appropriate phrases

### 2.3 Key Performance Indicators (KPIs)
- Daily active users (staff)
- Phrases accessed per session
- Speech recognition accuracy
- Customer feedback scores
- Time saved per interaction

## 3. User Personas

### 3.1 Library Staff Persona
**Name**: Sarah Chen
**Role**: Library Assistant
**Age**: 28
**Experience**: 3 years in library services
**Pain Points**:
- Struggles to communicate with customers who speak Mandarin, Cantonese, or other languages
- Needs quick access to common phrases
- Wants to provide professional service despite language barriers
**Goals**:
- Communicate effectively with all customers
- Provide consistent service quality
- Save time in customer interactions

### 3.2 Customer Persona
**Name**: Li Wei
**Role**: Library Customer
**Age**: 45
**Language**: Mandarin (primary), limited English
**Pain Points**:
- Difficulty communicating library needs in English
- Unfamiliar with library procedures and services
- Needs directions and assistance with library resources
**Goals**:
- Access library services independently
- Understand library policies and procedures
- Get help when needed

## 4. Functional Requirements

### 4.1 Core Features

#### 4.1.1 Multi-Language Support
**Requirement**: Support 10 languages with native text and audio
**Languages**:
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

**Acceptance Criteria**:
- All languages display native text correctly
- Audio playback works for all supported languages
- Language selection is intuitive and accessible

#### 4.1.2 User Interface Modes
**Requirement**: Separate interfaces for staff and customers

**Staff Mode Features**:
- Language selection for staff communication
- Category-based phrase organization
- AI-powered phrase suggestions
- Speech synthesis for staff phrases
- Firebase integration for conversation logging

**Customer Mode Features**:
- Language selection for customer communication
- Simplified phrase categories
- Text-to-speech for customer phrases
- QR code integration for directions

**Acceptance Criteria**:
- Clear mode switching
- Appropriate features for each user type
- Intuitive navigation

#### 4.1.3 Speech Recognition & Synthesis
**Requirement**: Real-time speech-to-text and text-to-speech

**Speech Recognition**:
- Browser-based Web Speech API integration
- Real-time transcription
- Language-specific recognition

**Speech Synthesis**:
- Text-to-speech for all supported languages
- Natural-sounding voices
- Adjustable playback controls

**Acceptance Criteria**:
- Speech recognition works in supported browsers
- Audio playback is clear and understandable
- No significant delay in speech processing

#### 4.1.4 Phrase Management
**Requirement**: Organized phrase library with categories

**Staff Categories**:
- General Enquiries
- Transactional
- Digital Services

**Customer Categories**:
- General Assistance
- Transactional
- Library Layout
- Language & Community Resources
- Digital Services

**Acceptance Criteria**:
- Phrases are logically organized
- Easy search and filtering
- Consistent categorization

### 4.2 Advanced Features

#### 4.2.1 AI-Powered Phrase Suggestions
**Requirement**: Generate contextual phrase suggestions using AI

**Functionality**:
- Input scenario description
- AI generates relevant phrases
- Translation to selected language
- Audio playback for suggestions

**Acceptance Criteria**:
- Suggestions are contextually relevant
- Translations are accurate
- Response time under 5 seconds

#### 4.2.2 Firebase Integration
**Requirement**: Backend data management and user authentication

**Features**:
- Anonymous user authentication
- Conversation logging
- Phrase database management
- Real-time data synchronization

**Acceptance Criteria**:
- Secure user authentication
- Reliable data persistence
- Real-time updates

#### 4.2.3 External Service Integration
**Requirement**: Integration with Google Maps and QR codes

**Google Maps Integration**:
- Directions to Centrelink from library
- Embedded map display
- QR code generation for mobile access

**Acceptance Criteria**:
- Maps load correctly
- QR codes are scannable
- Directions are accurate

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Page Load Time**: < 3 seconds on standard internet connection
- **Speech Recognition**: < 1 second response time
- **Audio Playback**: < 500ms delay
- **AI Suggestions**: < 5 seconds response time

### 5.2 Reliability Requirements
- **Uptime**: 99.5% availability
- **Error Rate**: < 1% for core functions
- **Data Loss**: Zero tolerance for user data
- **Backup**: Daily automated backups

### 5.3 Security Requirements
- **Authentication**: Secure anonymous authentication
- **Data Protection**: Encrypted data transmission
- **API Security**: Secure API key management
- **Privacy**: No personal data collection

### 5.4 Usability Requirements
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile Responsive**: Works on all device sizes
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge
- **Intuitive Design**: < 5 minutes to learn basic functions

### 5.5 Scalability Requirements
- **Concurrent Users**: Support 100+ simultaneous users
- **Database**: Handle 10,000+ phrases
- **API Limits**: Respect external API rate limits
- **Storage**: Efficient data storage and retrieval

## 6. Technical Architecture

### 6.1 Frontend Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS with Tailwind-inspired classes
- **State Management**: React Hooks
- **Speech API**: Web Speech API

### 6.2 Backend Technology Stack
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **API Integration**: Google Translate API, Google Maps API

### 6.3 External Dependencies
- **Google Cloud Services**:
  - Cloud Translation API
  - Maps Embed API
  - Places API
- **Firebase Services**:
  - Firestore Database
  - Authentication
  - Hosting
- **Third-party Services**:
  - QR Code generation API

## 7. User Interface Design

### 7.1 Design System
- **Brand Colors**: Georges River Council teal (#00A99D)
- **Typography**: Work Sans font family
- **Layout**: Responsive grid system
- **Components**: Consistent button and card designs

### 7.2 Key UI Components
- **Language Selection**: Rounded button pills
- **Mode Toggle**: Primary/accent color buttons
- **Phrase Cards**: White cards with shadow effects
- **Audio Controls**: Circular play buttons
- **Category Filters**: Filter button groups

### 7.3 Responsive Design
- **Desktop**: Full feature set with grid layouts
- **Tablet**: Adapted layouts with touch-friendly controls
- **Mobile**: Single-column layout with larger touch targets

## 8. Data Requirements

### 8.1 Phrase Database Structure
```javascript
{
  id: "unique_id",
  english: "English phrase",
  translations: {
    "zh-CN": "Mandarin translation",
    "zh-HK": "Cantonese translation",
    // ... other languages
  },
  category: "General Enquiries",
  type: "staff" | "customer",
  audioUrl: "optional_audio_url"
}
```

### 8.2 User Data Structure
```javascript
{
  userId: "anonymous_user_id",
  sessionData: {
    language: "Mandarin",
    mode: "staff",
    timestamp: "2024-01-01T00:00:00Z"
  },
  conversationLog: [
    {
      phrase: "phrase_id",
      timestamp: "2024-01-01T00:00:00Z",
      userType: "staff"
    }
  ]
}
```

## 9. Integration Requirements

### 9.1 Google Translate API
- **Purpose**: AI-powered phrase suggestions
- **Authentication**: API key management
- **Rate Limiting**: Respect API quotas
- **Error Handling**: Graceful fallback for API failures

### 9.2 Google Maps API
- **Purpose**: Directions and location services
- **Features**: Embedded maps, QR code generation
- **Authentication**: API key for production
- **Usage**: Maps Embed API for directions

### 9.3 Firebase Services
- **Firestore**: Real-time database for phrases and user data
- **Authentication**: Anonymous user authentication
- **Hosting**: Web application hosting
- **Security Rules**: Data access control

## 10. Testing Requirements

### 10.1 Functional Testing
- **Unit Tests**: Component and function testing
- **Integration Tests**: API integration testing
- **End-to-End Tests**: Complete user workflow testing
- **Speech Testing**: Audio functionality validation

### 10.2 Performance Testing
- **Load Testing**: Concurrent user simulation
- **Stress Testing**: API limit testing
- **Browser Testing**: Cross-browser compatibility
- **Mobile Testing**: Responsive design validation

### 10.3 Accessibility Testing
- **WCAG Compliance**: Accessibility standards testing
- **Screen Reader**: VoiceOver, NVDA compatibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Visual accessibility validation

## 11. Deployment & Operations

### 11.1 Deployment Strategy
- **Environment**: Firebase Hosting
- **CI/CD**: Automated deployment pipeline
- **Version Control**: Git-based workflow
- **Rollback**: Quick rollback capability

### 11.2 Monitoring & Analytics
- **Performance Monitoring**: Firebase Performance
- **Error Tracking**: Firebase Crashlytics
- **Usage Analytics**: Firebase Analytics
- **User Feedback**: In-app feedback collection

### 11.3 Maintenance
- **Regular Updates**: Monthly feature updates
- **Security Patches**: Immediate security updates
- **Database Maintenance**: Regular data cleanup
- **API Monitoring**: External service health checks

## 12. Risk Assessment & Mitigation

### 12.1 Technical Risks
- **Speech API Limitations**: Browser compatibility issues
- **API Rate Limits**: External service restrictions
- **Data Loss**: Firebase service outages
- **Performance**: Slow loading on poor connections

### 12.2 Mitigation Strategies
- **Fallback Mechanisms**: Offline phrase access
- **Caching**: Local storage for critical data
- **Error Handling**: Graceful degradation
- **Monitoring**: Proactive issue detection

## 13. Future Enhancements

### 13.1 Phase 2 Features
- **Offline Mode**: Full offline functionality
- **Voice Recognition**: Real-time speech input
- **Conversation History**: Persistent chat logs
- **Custom Phrases**: User-defined phrase additions

### 13.2 Phase 3 Features
- **Machine Learning**: Improved phrase suggestions
- **Multi-Modal**: Image and text recognition
- **Integration**: Library management system integration
- **Analytics**: Advanced usage analytics

## 14. Success Criteria

### 14.1 Launch Success Metrics
- **Adoption**: 50% of library staff using app within 3 months
- **Usage**: Average 10+ phrases accessed per session
- **Feedback**: 4.5+ star rating from users
- **Performance**: < 2 second average load time

### 14.2 Long-term Success Metrics
- **Expansion**: Adoption by additional library branches
- **Feature Usage**: 80% of users utilizing AI suggestions
- **Customer Satisfaction**: Measurable improvement in service quality
- **Cost Savings**: Reduced need for translation services

## 15. Conclusion

The Babel Fish app addresses a critical need in library services by providing immediate, accessible communication tools for staff and customers. The combination of pre-built phrases, AI-powered suggestions, and speech technology creates a comprehensive solution for language barriers in library settings.

The modular architecture and integration with existing services ensure scalability and maintainability, while the focus on user experience and accessibility ensures broad adoption across diverse user groups.

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: Quarterly  
**Stakeholders**: Library Management, IT Department, Staff Representatives 

## Critical Security Issues

### 1. **Hardcoded Credentials in Source Code**
- **Wi-Fi Password Exposure**: The app contains hardcoded Wi-Fi credentials in the main HTML file:
  ```html
  <li>Password: "Library2024"</li>
  ```
  This password is also embedded in a QR code URL that's publicly accessible.

### 2. **API Key Management Issues**
- **Empty API Keys**: The Gemini API key is set to an empty string in `App.jsx`:
  ```javascript
  const apiKey = ""; // If you want to use models other than gemini-2.0-flash...
  ```
- **Placeholder Configuration**: Firebase configuration uses placeholder values:
  ```javascript
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  ```
- **Environment Variable Fallbacks**: The Google Translate integration has fallback to hardcoded values:
  ```javascript
  const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || 'YOUR_API_KEY_HERE';
  ```

### 3. **Client-Side Security Vulnerabilities**
- **Exposed Firebase Config**: Firebase configuration is stored in client-side JavaScript where it's visible to anyone who inspects the code
- **Anonymous Authentication**: The app uses Firebase anonymous authentication, which while intended for privacy, could be exploited for abuse
- **No Input Validation**: User inputs for AI suggestions aren't properly sanitized before being sent to external APIs

### 4. **Data Privacy Concerns**
- **Conversation Logging**: The app logs conversations to Firebase, potentially storing sensitive library interactions
- **No Data Encryption**: User data and conversation logs aren't encrypted in transit or at rest
- **Public Repository**: The entire codebase is in a public repository, exposing all security configurations

### 5. **External API Security**
- **Unrestricted API Access**: No rate limiting or access controls on external API calls
- **Error Information Leakage**: Detailed error messages could expose internal system information
- **No API Key Rotation**: No mechanism for rotating compromised API keys

## Recommendations

### Immediate Actions:
1. **Remove hardcoded credentials** from the source code
2. **Implement proper environment variable management** for all API keys
3. **Add input validation and sanitization** for all user inputs
4. **Implement rate limiting** for API calls
5. **Add HTTPS enforcement** for all external communications

### Medium-term Improvements:
1. **Implement proper authentication** with user roles and permissions
2. **Add data encryption** for sensitive information
3. **Implement API key rotation** mechanisms
4. **Add security headers** and CSP policies
5. **Implement proper error handling** without information leakage

### Long-term Security Enhancements:
1. **Regular security audits** of the codebase
2. **Implement monitoring and alerting** for suspicious activities
3. **Add penetration testing** to the development lifecycle
4. **Create a security incident response plan**

The app has good intentions for library communication, but the current implementation has several security vulnerabilities that need to be addressed before production deployment. 