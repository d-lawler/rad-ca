# Body Classes System

The body classes system automatically adds classes to `document.body` for page identification and device detection.

## Page Classes

Page classes are automatically generated based on the route path:

- `/` → `page-home`
- `/about` → `page-about`
- `/books` → `page-books`
- `/projects` → `page-projects`
- `/stuff` → `page-stuff`
- `/books/some-book` → `page-books-some-book`

## Device Detection Classes

### Device Type
- `mobile-device` - Any mobile device
- `desktop-device` - Desktop/laptop computers
- `tablet-device` - Tablet devices
- `phone-device` - Phone devices

### Operating System
- `ios-device` - iOS devices (iPhone, iPad)
- `android-device` - Android devices

### Touch Capability
- `touch-device` - Supports touch input
- `no-touch-device` - No touch input

### Browser Detection
- `chrome-browser` - Google Chrome
- `firefox-browser` - Mozilla Firefox
- `safari-browser` - Safari
- `edge-browser` - Microsoft Edge

### Screen Size (Responsive)
- `screen-xs` - < 640px
- `screen-sm` - 640px - 767px
- `screen-md` - 768px - 1023px
- `screen-lg` - 1024px - 1279px
- `screen-xl` - 1280px - 1535px
- `screen-xxl` - ≥ 1536px

### Mobile Menu State
- `mobile-menu-open` - When mobile menu is open

## Usage Examples

### Page-specific styles
```scss
body.page-home {
    // Styles only for homepage
    .ca-wordmark {
        // Homepage wordmark styles
    }
}

body.page-books {
    // Styles only for books page
}
```

### Device-specific styles
```scss
body.mobile-device {
    // Styles for all mobile devices
    .header {
        padding: 1rem;
    }
}

body.desktop-device {
    // Styles for desktop only
    .header {
        padding: 2rem;
    }
}
```

### Combined selectors
```scss
body.page-home.mobile-device {
    // Homepage on mobile devices
}

body.page-projects.desktop-device.chrome-browser {
    // Projects page on desktop Chrome
}
```

### Screen size responsive
```scss
body.screen-xs {
    // Extra small screens
}

body.screen-lg {
    // Large screens
}
```

## Implementation

Classes are automatically applied by:
1. **Plugin**: `plugins/body-classes.client.js` - Early device detection
2. **Layout**: `layouts/default.vue` - Page classes and route changes
3. **Composable**: `composables/useBodyClasses.js` - Core logic

Classes are automatically updated on route changes and window resize.