# Prophecy of the Day Component

A beautiful, interactive component that displays daily inspirational Bible verses on the home page of The Bible Project application.

## Features

### 🌟 **Daily Verse Selection**
- **Consistent Daily Verse**: Shows the same verse for each day based on day of year
- **100 Positive Verses**: Curated collection of uplifting Bible verses
- **Bilingual Support**: Full Telugu and English translations
- **Refresh Function**: Users can get a new random verse with the refresh button

### 🎨 **Design & Styling**
- **Floating Design**: Positioned above the carousel with high z-index (1000)
- **Glass Morphism**: Beautiful backdrop blur effect with transparency
- **Theme Adaptive**: Automatically adjusts to light and dark themes
- **Responsive**: Mobile-friendly design that adapts to all screen sizes
- **Smooth Animations**: Fade-in slide-down animation and hover effects

### 📱 **User Experience**
- **High Visibility**: Positioned at the top center of the home page
- **Interactive**: Refresh button with rotation animation
- **Accessible**: Proper hover states and focus indicators
- **Professional**: Clean typography and consistent spacing

## Implementation

### Component Structure
```jsx
<ProphecyOfTheDay lang={lang} />
```

### Data Source
- **JSON File**: `src/assets/data/positiveVerses.json`
- **100 Verses**: Each verse includes:
  - English verse and reference
  - Telugu translation and reference
  - Unique ID for tracking

### Algorithm
```javascript
// Daily verse (same each day)
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
const index = dayOfYear % positiveVerses.verses.length;

// Random verse (on refresh)
const randomIndex = Math.floor(Math.random() * positiveVerses.verses.length);
```

## Styling Features

### Glass Morphism Effect
- **Backdrop Filter**: `backdrop-filter: blur(10px)`
- **Semi-transparent**: `rgba(255, 255, 255, 0.95)` for light theme
- **Border**: Subtle translucent borders
- **Shadow**: Layered box-shadows for depth

### Responsive Breakpoints
- **Desktop**: Full width with side margins
- **Tablet**: Adjusted spacing and padding
- **Mobile**: Compact design with vertical layout
- **Small Mobile**: Further optimized for tiny screens

### Theme Support
- **Light Theme**: White background with blue accents
- **Dark Theme**: Dark background with blue highlights
- **Smooth Transitions**: 0.3s ease transitions for all elements

## CSS Classes

### Main Classes
- `.prophecy-of-the-day` - Main container
- `.prophecy-container` - Content wrapper with glass effect
- `.prophecy-header` - Title and refresh button section
- `.prophecy-content` - Verse text and reference section

### Interactive Elements
- `.refresh-button` - Animated refresh button
- `.verse-text` - Stylized blockquote for verse
- `.verse-reference` - Citation styling

## Animations

### Entry Animation
```css
@keyframes fadeInSlideDown {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

### Hover Effects
- **Container**: Subtle lift on hover
- **Refresh Button**: 180° rotation on hover, 360° on click
- **Shadow Enhancement**: Deeper shadows on interaction

## Integration

### Home Page Layout
```jsx
<div style={{ position: 'relative', height: '100%' }}>
  <ProphecyOfTheDay lang={lang} />
  <ImageCarousel images={carouselImages} autoPlayInterval={6000} />
</div>
```

### Z-Index Management
- **Prophecy Component**: z-index 1000
- **Carousel**: Default z-index (behind prophecy)
- **Navigation**: Higher z-index (above prophecy when needed)

## Customization

### Adding More Verses
1. Edit `src/assets/data/positiveVerses.json`
2. Add new verse objects with required fields:
   ```json
   {
     "id": 101,
     "verse": "English verse text...",
     "reference": "Bible Reference",
     "verseTelugu": "Telugu translation...",
     "referenceTelugu": "Telugu reference"
   }
   ```

### Styling Modifications
- Edit `src/components/ProphecyOfTheDay.css`
- Customize colors, spacing, animations
- Adjust responsive breakpoints

### Positioning Changes
- Modify CSS positioning in `.prophecy-of-the-day`
- Adjust z-index values if needed
- Update responsive positioning

## Accessibility

- **Semantic HTML**: Proper use of blockquote and cite elements
- **Color Contrast**: WCAG compliant color combinations
- **Focus States**: Visible focus indicators for keyboard navigation
- **Screen Readers**: Properly structured content with meaningful headings
- **Responsive Text**: Scales appropriately on all devices

## Performance

- **Lightweight**: Minimal JavaScript overhead
- **CSS Animations**: Hardware-accelerated transforms
- **Efficient Rendering**: Uses CSS-only animations where possible
- **Optimized Images**: No heavy assets, icon-based design
