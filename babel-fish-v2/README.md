# Babel Fish - Georges River Libraries Multilingual Communication Tool

A **lightweight, fast, and simple** multilingual communication application designed to bridge language barriers between library staff and customers from diverse cultural backgrounds.

## 🚀 **INSTANT START - NO BUILD REQUIRED!**

### **Option 1: Double-click to start (Windows)**
```
start.bat
```

### **Option 2: PowerShell (Windows)**
```
.\start.ps1
```

### **Option 3: Manual start**
Simply double-click `index.html` or open it in any web browser!

## 🌟 **Features**

### **Staff Mode**
- **General Enquiries**: Common questions and responses
- **Transactional**: Library card applications, fines, fees
- **Digital Services**: Computer help, internet access, printing

### **Customer Mode**
- **General Assistance**: Basic library information and help
- **Transactional**: Account management, borrowing, returns
- **Library Layout**: Directions and facility information
- **Language & Community Resources**: Cultural programs and language support
- **Digital Services**: Technology assistance and online resources

### **Multilingual Support**
- **10 Languages**: Mandarin, Cantonese, Nepali, Greek, Arabic, Macedonian, Spanish, Italian, Indonesian, English
- **Native Scripts**: Proper display of non-Latin alphabets
- **Text-to-Speech**: Audio pronunciation for all languages
- **Cultural Context**: Appropriate translations for library settings

### **Special Features**
- **QR Code Integration**: Direct access to Google Maps directions
- **Centrelink Integration**: Location-based assistance for government services
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 🎯 **Why This Version is Better**

### **✅ Advantages of Vanilla JavaScript**
- **Instant deployment** - No build process needed
- **Zero dependencies** - No npm install required
- **Better performance** - No framework overhead
- **Easier maintenance** - Single file to edit
- **Universal compatibility** - Works in any modern browser
- **Faster development** - No dependency management

### **✅ Why Vanilla JavaScript is Perfect**
- **Simple and lightweight** - No framework overhead
- **Fast performance** - Direct DOM manipulation
- **Easy maintenance** - Single file to edit
- **Universal compatibility** - Works in any modern browser
- **No build process** - Instant development and deployment

## 🏗️ **Project Structure**

```
babel-fish-v2/
├── index.html              # 🎯 MAIN APPLICATION (Single file!)
├── start.bat               # Windows startup script
├── start.ps1               # PowerShell startup script
├── README.md               # This file

└── server/                 # (Legacy Express files - can be deleted)
```

## 🛠️ **Technology Stack**

### **Frontend (All in one file!)**
- **Vanilla JavaScript**: Modern ES6+ features
- **CSS Grid/Flexbox**: Responsive layouts
- **HTML5**: Semantic markup
- **Speech Synthesis API**: Browser-based text-to-speech

### **No Backend Required**
- **Local data**: All translations stored in the HTML file
- **No database**: No server setup needed
- **No API calls**: Everything works offline

## 🌍 **Language Support**

| Language | Code | Native Name | Script |
|----------|------|-------------|---------|
| Mandarin | zh-CN | 普通话 | Chinese |
| Cantonese | zh-HK | 粤语 | Chinese |
| Nepali | ne-NP | नेपाली | Devanagari |
| Greek | el-GR | Ελληνικά | Greek |
| Arabic | ar-SA | العربية | Arabic |
| Macedonian | mk-MK | Македонски | Cyrillic |
| Spanish | es-ES | Español | Latin |
| Italian | it-IT | Italiano | Latin |
| Indonesian | id-ID | Bahasa Indonesia | Latin |
| English | en-US | English | Latin |

## 📱 **Usage Guide**

### **For Library Staff**
1. **Select Staff Mode** from the top-right toggle
2. **Choose Language** for customer communication
3. **Select Category** to filter relevant phrases
4. **Click Play Button** to speak phrases aloud
5. **Use QR Code** to provide directions to Centrelink

### **For Customers**
1. **Select Customer Mode** from the top-right toggle
2. **Choose Language** for your preferred language
3. **Browse Categories** to find relevant information
4. **Listen to Phrases** by clicking the speaker icon
5. **Get Directions** using the integrated maps feature

## 🎯 **Use Cases**

### **Library Staff Scenarios**
- Greeting customers in their native language
- Explaining library policies and procedures
- Assisting with technology and digital services
- Providing directions and facility information
- Handling transactions and account management

### **Customer Scenarios**
- Asking for help in their preferred language
- Understanding library services and resources
- Getting assistance with technology
- Finding specific areas within the library
- Accessing community and cultural programs

## 🔧 **Customization**

### **Adding New Phrases**
Simply edit the `phrases` array in `index.html`:

```javascript
{
    type: 'staff',
    category: 'General Enquiries',
    english: 'Your new phrase here',
    translations: {
        'zh-CN': '中文翻译',
        'zh-HK': '粵語翻譯',
        // ... other languages
    }
}
```

### **Adding New Languages**
Add to the `LANGUAGE_CODES` object:

```javascript
'NewLanguage': { code: 'xx-XX', nativeName: 'Native Name' }
```

### **Styling Changes**
All CSS is inline in the `<style>` section - easy to modify!

## 🚀 **Deployment**

### **Local Use**
- Just open `index.html` in any browser
- Works completely offline
- No server required

### **Web Hosting**
- Upload `index.html` to any web server
- Works on GitHub Pages, Netlify, Vercel, etc.
- No build process needed

### **Library Kiosks**
- Perfect for library computers
- No internet connection required
- Instant startup

## 🔮 **Future Enhancements**

- **Offline PWA**: Add service worker for offline functionality
- **Local Storage**: Save user preferences
- **More Languages**: Expand language support
- **Custom Categories**: Allow staff to create custom phrase categories
- **Voice Recognition**: Add speech-to-text input

## 🤝 **Contributing**

This project is developed for Georges River Libraries. For contributions or questions, please contact the library staff.

## 📄 **License**

MIT License - See LICENSE file for details.

## 🙏 **Acknowledgments**

- **Georges River Council**: Project sponsorship and support
- **Library Staff**: Domain expertise and user feedback
- **Multilingual Community**: Cultural insights and language validation

---

**Built with ❤️ for the Georges River Libraries community**

**Now faster, simpler, and easier to use than ever before!** 🚀
