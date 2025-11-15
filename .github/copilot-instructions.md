# GitHub Copilot Instructions for Memory Road

## Project Overview
Memory Road is a 24-hour hackathon project that helps elderly people create beautiful AI-powered diary entries. Users speak about their day, upload photos, and AI generates a warm, personal narrative displayed on an interactive road visualization.

## Code Style & Conventions

### Language & Framework
- Use **JavaScript** (NOT TypeScript) for all files
- Use Next.js App Router syntax
- Use functional components with React hooks
- Use `'use client'` directive for client components

### Component Structure
Always use ShadCN components for UI. Before creating any UI element:
1. Check if ShadCN has it: button, dialog, card, input, textarea, select, etc.
2. Import from `@/components/ui/<component>`
3. Never create custom buttons, modals, or form elements

Example:
```javascript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
```

### File Organization
- **Components**: `/src/components/` - React components only
- **Utils**: `/src/lib/` - Pure functions, no React
- **API Routes**: `/src/app/api/` - Server-side endpoints
- **Single page**: `/src/app/page.js` - Main application (NO OTHER PAGES)
- **Documentation**: `/llm-docs/` - Framework-specific documentation (CHECK HERE FIRST!)

### Documentation Resources
**CRITICAL**: Before generating framework-specific code (especially PixiJS), check the `llm-docs/` directory for helpful documentation files. Always reference these docs to ensure you're using current APIs and best practices.

### Styling Rules
- Use Tailwind CSS classes exclusively
- Use custom color palette: `cream`, `warmBeige`, `terracotta`, `sage`, `goldenrod`, `softBrown`
- Large fonts: `text-lg`, `text-xl`, `text-2xl` (for elderly users)
- Generous spacing: `p-6`, `gap-6`, `space-y-4`
- Rounded corners: `rounded-lg`, `rounded-full`

Example:
```javascript
<Button className="bg-terracotta hover:bg-terracotta/90 text-white px-6 py-3 rounded-full">
  + New Memory
</Button>
```

### Code Simplicity (KISS Principle)
- Keep functions under 20 lines when possible
- Avoid complex abstractions
- Prefer clarity over cleverness
- Use descriptive variable names: `voiceTranscript` not `vt`
- Comment complex logic with WHY, not WHAT

### State Management
- Use `useState` for local state
- Use `useEffect` for side effects
- NO external state management libraries (Redux, Zustand, etc.)
- Pass props down explicitly (no context unless absolutely necessary)

### Error Handling
- Always handle errors gracefully
- Show user-friendly messages (remember: elderly users)
- Use try/catch for async operations
- Provide fallbacks for failed operations

Example:
```javascript
try {
  const entry = await saveEntry(voiceText, images);
  setEntries([...entries, entry]);
} catch (error) {
  console.error('Failed to save entry:', error);
  // Show friendly error message to user
}
```

## API Integration

### Claude API (for diary generation)
- Endpoint: `/api/generate-entry`
- Input: `{ voiceText: string, images: string[] }`
- Output: `{ aiGeneratedText: string }`
- Use warm, storytelling tone in prompts
- Process voice + images together (multimodal)

### Voice Recording
- Use Web Speech API: `window.webkitSpeechRecognition`
- Provide visual feedback during recording
- Handle browser compatibility gracefully

### Image Handling
- Convert to base64 for localStorage
- Limit to 3 images per entry (keep it simple)
- Show previews before upload

## Accessibility & UX for Elderly Users

### Touch Targets
- Minimum 44x44px for all interactive elements
- Large buttons: `px-6 py-3` or larger
- Generous spacing between clickable items

### Visual Design
- High contrast text (WCAG AA minimum)
- Clear visual hierarchy
- No subtle hover states (use obvious feedback)
- Warm, inviting colors (not cold or clinical)

### Interaction Patterns
- One action per screen/modal
- Clear labels (not icons alone)
- Immediate feedback for all actions
- Loading states for async operations

## Specific Implementation Patterns

### Modal Pattern
```javascript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="bg-warmBeige border-terracotta max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl text-softBrown">Title</DialogTitle>
    </DialogHeader>
    <div className="space-y-6 py-4">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>
```

### Button Pattern
```javascript
<Button
  onClick={handleClick}
  disabled={isLoading}
  className="bg-terracotta hover:bg-terracotta/90 w-full"
>
  {isLoading ? 'Loading...' : 'Action Text'}
</Button>
```

### Card Pattern
```javascript
<Card className="p-6 bg-cream border-sage">
  <h3 className="text-lg font-semibold text-softBrown mb-4">Title</h3>
  {/* Content */}
</Card>
```

## Performance Considerations
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations only
- Lazy load PixiJS (it's a large library)
- Optimize images (compress before storage)

## Testing Approach
- Manual testing (no time for test suites in 24h)
- Test on tablet viewport (primary device)
- Test with large system fonts
- Test with slow network (throttle in DevTools)

## Common Pitfalls to Avoid
- ❌ Creating custom UI components instead of using ShadCN
- ❌ Using TypeScript (we use JavaScript for speed)
- ❌ Creating multiple pages (single-page app only)
- ❌ Small fonts or low contrast
- ❌ Complex state management
- ❌ 3D graphics (use 2D PixiJS only)
- ❌ Over-engineering for edge cases

## Priority Guidelines
1. **Working > Perfect**: Ship functional code fast
2. **User Experience > Code Beauty**: Elderly users need simple, clear UX
3. **Visual Polish > Performance**: Warm, inviting feel is critical
4. **Core Features > Nice-to-haves**: Voice + Image + AI + Road visualization

---

**Remember**: This is a 24-hour hackathon for helping elderly people. Keep it simple, warm, and working.
