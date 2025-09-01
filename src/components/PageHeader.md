# PageHeader Component

A consistent page header component with theme support for The Bible Project application.

## Usage

```jsx
import PageHeader from './components/PageHeader';
import { FaUsers } from 'react-icons/fa';

// Basic usage
<PageHeader 
  title="Page Title"
  subtitle="Optional subtitle description"
  icon={<FaUsers />}
/>

// With actions
<PageHeader 
  title="Page Title"
  subtitle="Optional subtitle"
  icon={<FaUsers />}
  actions={
    <button>Action Button</button>
  }
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | The main page title |
| `subtitle` | `string` | Optional | Subtitle or description text |
| `icon` | `React.ReactNode` | Optional | Icon component (usually from react-icons) |
| `className` | `string` | `''` | Additional CSS classes |
| `actions` | `React.ReactNode` | Optional | Action buttons or components on the right side |

## Features

- **Theme Support**: Automatically adapts to light and dark themes
- **Responsive Design**: Mobile-friendly layout that stacks on smaller screens
- **Icon Integration**: Styled icon container with gradient background
- **Flexible Actions**: Support for buttons or other components in the header
- **Consistent Styling**: Unified appearance across all pages

## Theme Variants

The component automatically applies the appropriate theme based on the `useTheme` context:

- **Light Mode**: Light background with dark text and subtle shadows
- **Dark Mode**: Dark background with light text and enhanced shadows

## Responsive Behavior

- **Desktop**: Icon and text side-by-side, actions on the right
- **Tablet**: Same as desktop with adjusted spacing
- **Mobile**: Stacked layout with full-width actions

## Examples

### Genealogy Page
```jsx
<PageHeader 
  title={lang === 'te' ? 'వంశావళి' : 'Genealogy'}
  subtitle={lang === 'te' ? 'బైబిల్ వంశావళి విభాగాలను ఎంచుకోండి.' : 'Select a genealogy section from the left.'}
  icon={<FaUsers />}
/>
```

### Maps Page
```jsx
<PageHeader 
  title={lang === 'te' ? 'మ్యాప్‌లు' : 'Maps'}
  subtitle={lang === 'te' ? 'మ్యాప్ విభాగాన్ని ఎంచుకోండి.' : 'Select a maps section from the left.'}
  icon={<FaMapMarkerAlt />}
/>
```

### With Actions
```jsx
<PageHeader 
  title="Biblical Family Tree"
  subtitle="Genealogical tree from Adam to Jesus"
  icon={<FaSitemap />}
  actions={
    <div>
      <button>Export</button>
      <button>Settings</button>
    </div>
  }
/>
```

## CSS Classes

The component uses the following CSS classes that can be customized:

- `.page-header` - Main container
- `.page-header-content` - Content wrapper
- `.page-header-left` - Left side (icon + text)
- `.page-header-icon` - Icon container
- `.page-header-text` - Text wrapper
- `.page-header-title` - Main title
- `.page-header-subtitle` - Subtitle text
- `.page-header-actions` - Actions container

## Accessibility

- Proper heading hierarchy (h1 for title)
- Semantic HTML structure
- Theme-aware color contrast
- Responsive design for all screen sizes
