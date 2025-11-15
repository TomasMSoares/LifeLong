# Memory Road - Team Development Guide

## 🎯 Project Structure

```
src/
├── app/
│   ├── page.js              # Main single-page application
│   └── globals.css          # Styles with warm color palette
├── components/
│   ├── RoadCanvas.js        # PixiJS visualization (TODO)
│   ├── CreateEntryModal.js  # Modal for creating memories
│   ├── EntryDetailModal.js  # Modal for viewing memories
│   ├── VoiceRecorder.js     # Voice input component
│   ├── ImageUpload.js       # Photo upload component
│   └── ui/                  # ShadCN components (Button, Dialog, Card)
└── lib/
    ├── storage.js           # localStorage/DB utilities (PLACEHOLDER)
    ├── voiceRecorder.js     # Web Speech API (PLACEHOLDER)
    ├── imageHandler.js      # Image processing (PLACEHOLDER)
    └── roadRenderer.js      # PixiJS rendering (PLACEHOLDER)
```

## 🎨 Color Palette (Warm & Cozy)

```css
cream:      #FFF8E7  /* Background */
warmBeige:  #F5E6D3  /* Cards/Modals */
terracotta: #E07A5F  /* Primary buttons */
sage:       #81B29A  /* Accents */
goldenrod:  #F4A259  /* Secondary buttons */
softBrown:  #8B7355  /* Text */
```

## 🔧 What's Working Now

✅ **UI Structure**: All components created with ShadCN
✅ **Modal flows**: Create entry → Display entry
✅ **State management**: Basic useState for entries
✅ **Warm styling**: Gradient backgrounds and colors

## 🚧 What Needs Implementation

### Core Features
- [ ] **lib/storage.js**: Implement localStorage persistence
- [ ] **lib/voiceRecorder.js**: Integrate Web Speech API or Whisper
- [ ] **lib/imageHandler.js**: Convert uploaded images to base64

### AI Integration
- [ ] Create `/app/api/generate-entry/route.js`
- [ ] Call Claude API with voice transcript + images
- [ ] Generate beautiful diary text

### Visualization
- [ ] **lib/roadRenderer.js**: Implement PixiJS canvas
- [ ] Draw winding road path
- [ ] Place entry markers on road
- [ ] Add zoom/pan with pixi-viewport
- [ ] Click handlers for entries

## 📝 Data Model

```javascript
{
  id: "1234567890",
  date: "2024-11-15T10:30:00Z",
  voiceTranscript: "Today I went to the park...",
  images: ["base64...", "base64..."],
  aiGeneratedText: "What a beautiful autumn day...",
  position: { x: 250, y: 400 }
}
```

## 🚀 Quick Start

```bash
pnpm run dev  # Already running on http://localhost:3000
```

## 💡 Tips

- Use ShadCN components religiously (`npx shadcn@latest add <component>`)
- Test on mobile - elderly users need large touch targets
- Keep transitions smooth and animations gentle
- Focus on readability - larger fonts, good contrast