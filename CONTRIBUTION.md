# Contributing to Beenama

Thank you for considering contributing to Beenama! This guide explains our styling standards and development practices.

## Styling Guidelines

Beenama uses a **cinematic black & white Android UI aesthetic** with smooth animations and responsive design. All styles are stored in `StyleSheet.create()` within each component file.

### Color Palette

We maintain a strict black & white color scheme with subtle grays for depth:

- **Primary Background**: `#000` (Pure black)
- **Secondary Background**: `#0a0a0a` (Very dark gray - for sections)
- **Tertiary Background**: `#1a1a1a` (Dark gray - for cards, inputs, buttons)
- **Text Primary**: `#fff` (White)
- **Text Secondary**: `#d4d4d4` (Light gray)
- **Text Tertiary**: `#999` (Medium gray - metadata)
- **Border/Divider**: `#333` or `#1a1a1a`
- **Overlay**: `rgba(0,0,0,0.5)` to `rgba(0,0,0,0.92)` (Varying opacity)

### Typography

- **Font Weights**: Use `'700'` (bold), `'800'` (extra bold), `'600'` (semi-bold), `'500'` (medium), `'400'` (normal)
- **Font Sizes**:
  - Titles: `20px` - `26px` with `fontWeight: '800'`
  - Section Headers: `18px` with `fontWeight: '800'`
  - Body Text: `14px` - `15px` with `fontWeight: '400'` to `'500'`
  - Labels/Metadata: `12px` - `14px` with `fontWeight: '500'` to `'600'`
  - Small Text: `11px` - `12px`

- **Letter Spacing**: Add `letterSpacing: 0.3` to `0.5` for titles and section headers for cinema effect
- **Line Height**: Use `lineHeight: 24` for body text, `lineHeight: 16` for labels

### Spacing

- **Margins/Padding**: Use consistent increments: `8px`, `12px`, `16px`, `18px`, `20px`, `24px`, `28px`
- **Gap (between items)**: `8px`, `10px`, `12px`, `14px`, `16px`
- **Vertical Spacing**: Use `marginVertical: 20` to `28` between major sections

### Border Radius

- **Cards/Posters**: `12px` to `14px`
- **Buttons**: `10px` to `12px`
- **Modal/Sheet**: `24px` to `28px` (top corners)
- **Circles**: `borderRadius: 40` to `45` (half the width/height)

### Animations & Transitions

All interactive elements should have smooth animations:

```javascript
// Button Press Animation
Animated.timing(scaleAnim, {
  toValue: 0.92,
  duration: 180,
  useNativeDriver: true,
}).start();

// Opacity Transition
Animated.timing(opacityAnim, {
  toValue: 0.7,
  duration: 180,
  useNativeDriver: true,
}).start();
```

**Duration Guidelines**:
- Press feedback: `180ms`
- Page transitions: `300ms`
- Loading animations: `1000ms` - `2000ms`

### Responsive Design

Use `Dimensions.get('window')` to detect screen size and adjust:

```javascript
const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const adjustedWidth = isSmallScreen ? width * 0.9 : width;
```

### Component-Specific Patterns

#### Poster Cards
- Use `Animated.View` with scale animation on press
- Add subtle overlay: `backgroundColor: 'rgba(0, 0, 0, 0.15)'`
- Title should use `numberOfLines={2}` for responsive text

#### Filter Modal
- Overlay: `backgroundColor: 'rgba(0,0,0,0.92)'`
- Content: `borderTopWidth: 1, borderTopColor: '#222'`
- Chips: `borderRadius: 22`, `borderWidth: 1.5`
- Active chips: `backgroundColor: '#fff'`

#### Page Headers
- Add `borderBottomWidth: 1, borderBottomColor: '#1a1a1a'`
- Use `paddingVertical: 18` for breathing room
- Title: `fontSize: 20, fontWeight: '800'`

#### Loading States
- Use `ActivityIndicator color="#fff"` with loading spinner
- Display on centered screen: `flex: 1, justifyContent: 'center', alignItems: 'center'`

### What NOT to Change

**IMPORTANT**: Do **NOT** modify styles in the search-related code:
- `Header.js` search bar and results styling (user-maintained)
- Search input styles
- Search results overlay

The search functionality has been carefully tuned for UX and should remain unchanged.

### Code Quality

- Use parallel animations with `Animated.parallel([])` for smooth combined effects
- Always use `useNativeDriver: true` for animations (performance)
- Remove overflow with `overflow: 'hidden'` on containers with rounded corners
- Add `zIndex` values strategically to prevent overlapping issues
- Use `elevation: 10` for Android shadow effects

### File Structure

Each page/component should have its StyleSheet at the bottom:

```javascript
export default function MyComponent() {
  // Component logic
}

const styles = StyleSheet.create({
  container: { /* styles */ },
  // ... other styles
});
```

### Testing Your Changes

After making style changes:

1. **Responsive**: Test on both small (< 400px) and large (> 600px) screens
2. **Animations**: Press buttons and verify smooth transitions
3. **Overflow**: Check no text or content is cut off
4. **Contrast**: Ensure text is readable with black background
5. **Loading**: Verify loading states display properly

### Commit Messages

When committing style changes, use clear messages:

```
style: refactor PosterCard animations and responsive sizing
style: improve FilterModal typography and spacing
style: update home page hero section styling
```

## Questions?

If you're unsure about the styling approach, check existing components like `PosterCard.js` or `FilterModal.js` for reference patterns.

Happy contributing!
