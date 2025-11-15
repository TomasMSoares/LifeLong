# Claude AI Instructions for Memory Road

## Project Context

**Memory Road** is a hackathon project (24-hour time constraint) for Junction Hackathon.

**Mission**: Help elderly people create beautiful digital diary entries using AI. They speak about their day, upload photos, and our app generates a beautifully written diary entry. These entries are displayed on an interactive "road" visualization.

**Target Users**: Elderly people (requires warm colors, large touch targets, simple UX, readable fonts)

## Core Development Principles

### 1. KISS Principle (Keep It Simple, Stupid)
- Write the minimal code necessary
- No over-engineering
- No premature optimization
- Focus on getting features working first, refine later
- If it takes more than 5 minutes to explain, it's too complex

### 2. Use ShadCN Religiously
- **ALWAYS** use ShadCN components for UI elements
- Before creating any UI component, check if ShadCN has it
- Install new components with: `npx shadcn@latest add <component>`
- Never create custom buttons, dialogs, cards, etc. when ShadCN provides them
- Available components: button, dialog, card, input, textarea, select, etc.

### 3. Follow Established Architecture

**File Structure** (DO NOT DEVIATE):
```
src/
├── app/
│   ├── page.js              # Single-page application (ONLY ONE PAGE)
│   ├── api/
│   │   └── generate-entry/route.js  # AI diary generation endpoint
│   └── globals.css
├── components/
│   ├── RoadCanvas.js        # PixiJS visualization
│   ├── CreateEntryModal.js  # Modal for creating memories
│   ├── EntryDetailModal.js  # Modal for viewing memories
│   ├── VoiceRecorder.js     # Voice input
│   ├── ImageUpload.js       # Photo upload
│   └── ui/                  # ShadCN components (auto-generated)
└── lib/
    ├── storage.js           # localStorage utilities
    ├── voiceRecorder.js     # Web Speech API
    ├── imageHandler.js      # Image processing
    └── roadRenderer.js      # PixiJS rendering
```

### 4. Technology Stack
- **Framework**: Next.js 14+ (App Router, JavaScript NOT TypeScript)
- **UI Library**: ShadCN (shadcn/ui)
- **Styling**: Tailwind CSS
- **2D Graphics**: PixiJS (for the interactive road)
- **AI**: Claude API (Anthropic)
- **Voice**: Web Speech API or Whisper
- **Storage**: localStorage (for hackathon speed)

### 5. Design System

**Color Palette** (Warm & Cozy):
```javascript
cream:      '#FFF8E7'  // Backgrounds
warmBeige:  '#F5E6D3'  // Cards/Modals
terracotta: '#E07A5F'  // Primary buttons
sage:       '#81B29A'  // Accents/borders
goldenrod:  '#F4A259'  // Secondary buttons
softBrown:  '#8B7355'  // Text
```

**Typography**:
- Use large, readable fonts (text-lg, text-xl, text-2xl)
- Prefer serif fonts for headings (font-serif)
- High contrast for readability

**Spacing**:
- Generous padding and margins
- Large touch targets (min 44x44px)
- Clear visual hierarchy

## Data Model

```javascript
DiaryEntry = {
  id: string,
  date: ISO string,
  voiceTranscript: string,
  images: string[],        // base64 or URLs
  aiGeneratedText: string, // Beautiful narrative from Claude
  position: { x: number, y: number }  // Position on road
}
```

## Implementation Guidelines

### When Adding Features
1. Check if ShadCN has a component for it
2. Keep functions small and focused
3. Use placeholder TODOs for complex logic (implement later)
4. Prioritize working code over perfect code
5. Test visually - does it look warm and inviting?

### When Writing Code
- Use JavaScript (not TypeScript) for speed
- Prefer functional components with hooks
- Keep state management simple (useState, no complex state libs)
- Comment WHY, not WHAT
- Use descriptive variable names

### When Styling
- Use Tailwind classes directly
- Use custom color palette (cream, warmBeige, etc.)
- Ensure accessibility (WCAG AA minimum)
- Test with large fonts enabled

### When Integrating AI
- Use Claude API for diary generation
- Process voice transcript + images together
- Generate warm, personal, storytelling narrative
- Handle errors gracefully (elderly users need reassurance)

## What NOT to Do
- ❌ Don't create multiple pages (it's a single-page app)
- ❌ Don't use TypeScript (we use JavaScript for speed)
- ❌ Don't create custom UI components (use ShadCN)
- ❌ Don't use 3D graphics (PixiJS is 2D only)
- ❌ Don't over-complicate (24-hour time limit!)
- ❌ Don't use dark mode (warm, bright colors only)
- ❌ Don't use small fonts or low contrast

## Priority Order
1. **Core Flow**: Voice input → Image upload → AI generation → Display
2. **Visual Polish**: Warm colors, smooth animations, beautiful typography
3. **Road Visualization**: Interactive PixiJS canvas with entry points
4. **Edge Cases**: Error handling, loading states, empty states

## Success Criteria
- Elderly person can create diary entry in < 2 minutes
- App feels warm, inviting, not intimidating
- Road visualization is delightful and easy to navigate
- AI-generated text is personal and meaningful
- Works on tablets (primary device for elderly)

---

Remember: **Ship working features fast, polish as you go, make it feel warm and human.**
