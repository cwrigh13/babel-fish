# 🚀 BABEL FISH APP - MVP CHECKLIST
**Georges River Libraries Translation Tool - Quick Launch**

## **🎯 MVP GOAL**
Get a working translation tool into library staff hands within **2-3 weeks** with core functionality only.

---

## **✅ MVP FEATURE SCOPE**

### **INCLUDED IN MVP:**
- ✅ Staff and Customer modes
- ✅ Basic language selection (Mandarin, Cantonese, + 3 others)
- ✅ Essential phrase categories (General, Transactional, Digital Services)
- ✅ Text-to-speech functionality
- ✅ Basic responsive design for tablets
- ✅ Core phrase library (30-50 essential phrases)
- ✅ Basic branding (logo + colors)
- ✅ Complex filtering systems
- ✅ Advanced popups and interactions

### **EXCLUDED FROM MVP (Future Versions):**
- ❌ AI phrase suggester
- ❌ Interactive maps with QR codes
- ❌ Extensive language support (start with 5 languages)
- ❌ Advanced analytics
- ❌ Admin panel

---

## **📋 MVP DEVELOPMENT CHECKLIST**

### **🏗️ WEEK 1: FOUNDATION & CORE SETUP**

#### **Day 1-2: Project Setup**
- [ ] Create React project with Vite/CRA
- [ ] Install essential dependencies:
  - [ ] Firebase (firestore, auth)
  - [ ] Tailwind CSS
  - [ ] Basic UI components
- [ ] Set up Git repository
- [ ] Configure development environment

#### **Day 3-4: Firebase & Data**
- [ ] Create Firebase project
- [ ] Set up Firestore database with basic structure:
  ```
  phrases/
    ├── {phraseId}
    │   ├── type: 'staff' | 'customer'
    │   ├── category: string
    │   ├── english: string
    │   └── translations: { lang: translation }
  ```
- [ ] Configure anonymous authentication
- [ ] Create initial data seeding script
- [ ] Test database connection

#### **Day 5-7: Core UI Foundation**
- [ ] Create basic app layout
- [ ] Implement staff/customer mode toggle
- [ ] Add language selection dropdown/buttons
- [ ] Create phrase card component
- [ ] Apply basic Georges River Libraries branding
- [ ] Ensure responsive layout for tablets

---

### **🚀 WEEK 2: CORE FEATURES**

#### **Day 8-10: Phrase System**
- [ ] Implement phrase fetching from Firestore
- [ ] Create phrase display logic:
  - [ ] Staff mode: English first, translation second
  - [ ] Customer mode: Translation first, English second
- [ ] Add basic category filtering (3 categories only)
- [ ] Implement real-time updates

#### **Day 11-12: Text-to-Speech & Advanced Features**
- [ ] Integrate Web Speech API
- [ ] Add speaker buttons to phrase cards
- [ ] Configure language-specific TTS:
  - [ ] English (en-AU)
  - [ ] Mandarin (zh-CN)
  - [ ] Cantonese (zh-HK)
  - [ ] 2 additional languages
- [ ] Add basic error handling for TTS
- [ ] Implement complex filtering system:
  - [ ] Category filter buttons with active states
  - [ ] "All" option plus individual categories
  - [ ] Filter state persistence
- [ ] Create advanced popup interactions:
  - [ ] Language choice popup for staff mode
  - [ ] "Do you prefer Mandarin/Cantonese" interactive card
  - [ ] Click-for-options functionality

#### **Day 13-14: Essential Content**
- [ ] Populate database with core phrases:
  - [ ] **General Enquiries (10 phrases)**
    - "Please follow me"
    - "Thank you"
    - "You are welcome"
    - "Please wait one moment"
    - "I understand"
    - And 5 more essential phrases
  - [ ] **Transactional (15 phrases)**
    - "Please show me your library card"
    - "Would you like to borrow these items?"
    - "The due date is listed on the receipt"
    - And 12 more transaction phrases
  - [ ] **Digital Services (10 phrases)**
    - "Would you like to use the internet?"
    - "Do you need help using the computer?"
    - And 8 more digital service phrases

---

### **🧪 WEEK 3: TESTING & LAUNCH**

#### **Day 15-17: Basic Testing**
- [ ] Test all phrases display correctly
- [ ] Verify TTS works for all languages
- [ ] Test mode switching
- [ ] Test on iPad and Android tablet
- [ ] Test basic responsive design
- [ ] Fix critical bugs only

#### **Day 18-19: Deployment**
- [ ] Set up Firebase Hosting or Netlify
- [ ] Configure production environment
- [ ] Deploy to staging for staff testing
- [ ] Create basic user guide (1-2 pages)

#### **Day 20-21: Staff Testing & Iteration**
- [ ] Conduct testing session with 2-3 library staff
- [ ] Gather immediate feedback
- [ ] Fix any critical usability issues
- [ ] Deploy to production
- [ ] Go live at one library location

---

## **🛠️ TECHNICAL IMPLEMENTATION NOTES**

### **Simplified Language System**
```javascript
const MVP_LANGUAGES = {
  'Mandarin': { code: 'zh-CN', nativeName: '普通话' },
  'Cantonese': { code: 'zh-HK', nativeName: '粤语' },
  'Arabic': { code: 'ar-SA', nativeName: 'العربية' },
  'Greek': { code: 'el-GR', nativeName: 'Ελληνικά' },
  'Nepali': { code: 'ne-NP', nativeName: 'नेपाली' }
};
```

### **Simplified Phrase Structure**
```javascript
const mvpPhrase = {
  id: 'phrase_001',
  type: 'staff', // or 'customer'
  category: 'General Enquiries',
  english: 'Thank you',
  translations: {
    'zh-CN': '谢谢您',
    'zh-HK': '多謝你',
    'ar-SA': 'شكرا لك',
    'el-GR': 'Ευχαριστώ',
    'ne-NP': 'धन्यवाद'
  }
};
```

### **Enhanced Component Structure**
```
src/
├── components/
│   ├── ModeToggle.jsx
│   ├── LanguageSelector.jsx
│   ├── PhraseCard.jsx
│   ├── CategoryFilter.jsx
│   ├── LanguageChoicePopup.jsx
│   ├── InteractiveCard.jsx
│   └── Modal.jsx
├── hooks/
│   ├── useFirestore.js
│   ├── useTTS.js
│   └── useFilters.js
├── services/
│   └── firebase.js
└── App.jsx
```

---

## **📊 MVP SUCCESS CRITERIA**

### **Functional Requirements**
- [ ] Staff can switch between modes
- [ ] Phrases display in correct order (English/translation)
- [ ] TTS works for at least 80% of phrases
- [ ] App loads in under 5 seconds on library tablets
- [ ] No critical bugs during 30-minute staff testing session
- [ ] Category filtering works smoothly across all modes
- [ ] Popup interactions function correctly (language choice, interactive cards)
- [ ] Filter state persists during mode switches

### **User Experience Requirements**
- [ ] Staff can find common phrases within 15 seconds using filters
- [ ] Mode switching is obvious and clear
- [ ] Language selection is intuitive
- [ ] Text is readable on tablet screens
- [ ] Popup interactions are smooth and responsive
- [ ] Filter buttons provide clear visual feedback

### **Business Requirements**
- [ ] Can handle basic customer interactions
- [ ] Reduces need for staff to use Google Translate
- [ ] Staff feel confident using it during real transactions

---

## **🔄 POST-MVP ITERATION PLAN**

### **Version 1.1 (Week 4-5)**
- [ ] Add AI phrase suggester
- [ ] Expand to 8-10 languages
- [ ] Add more phrase categories
- [ ] Improve filtering system

### **Version 1.2 (Week 6-7)**
- [ ] Add interactive maps for directions
- [ ] Implement advanced popups
- [ ] Add usage analytics
- [ ] Expand phrase library to 100+ phrases

### **Version 2.0 (Week 8+)**
- [ ] Admin panel for phrase management
- [ ] Advanced features from original PRD
- [ ] Multi-library deployment

---

## **⚠️ MVP CONSTRAINTS & TRADE-OFFS**

### **Acceptable Limitations**
- ✅ Limited to 5 languages initially
- ✅ Manual phrase management (no admin panel)
- ✅ Basic error handling
- ✅ Limited to essential popup interactions only
- ✅ Simple animation effects (not complex transitions)

### **Non-Negotiable Requirements**
- ❌ Must work on library tablets
- ❌ TTS must function reliably
- ❌ Mode switching must be clear
- ❌ Staff and customer modes must be distinct

---

## **🚨 RISK MITIGATION**

### **High-Priority Risks**
1. **TTS Compatibility**: Test on actual library tablets early
2. **Translation Quality**: Validate with native speakers before launch
3. **Staff Adoption**: Include staff in daily testing from Week 2
4. **Performance**: Keep phrase database small initially

### **Quick Solutions**
- **Backup TTS**: If native TTS fails, display phonetic pronunciation
- **Offline Mode**: Store essential phrases in localStorage
- **Error Handling**: Clear error messages and fallback options

---

## **📞 MVP LAUNCH STRATEGY**

### **Soft Launch Plan**
1. **Week 3**: Deploy to one library location
2. **Day 1-3**: Shadow staff during real interactions
3. **Day 4-7**: Gather feedback and iterate
4. **Week 4**: Roll out to 2-3 more locations
5. **Week 5**: Full deployment across library system

### **Success Metrics**
- [ ] Used in at least 5 real customer interactions per day
- [ ] Staff confidence level 7/10 or higher
- [ ] Zero critical bugs reported in first week
- [ ] Customer feedback is neutral or positive

---

**🎯 BOTTOM LINE: A working, useful translation tool in library staff hands in 3 weeks, not 8-10 weeks.** 