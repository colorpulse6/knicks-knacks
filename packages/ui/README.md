# UI Package

Shared React and React Native UI components for all apps in the monorepo.

## Overview

This package provides a set of reusable UI components that work across both web (React) and mobile (React Native) platforms. Components use conditional rendering based on the platform to provide appropriate implementations.

## Usage

### Installation

The package is automatically available to all apps in the monorepo. No additional installation steps are required.

### Importing Components

```tsx
import { Button } from "@knicks-knacks/ui";

// In your component
function MyComponent() {
  return (
    <Button 
      text="Click me" 
      onPress={() => console.log('Button pressed')} 
      variant="primary" 
    />
  );
}
```

## Available Components

### Button

A button component that works on both web and mobile.

```tsx
<Button 
  text="Submit" 
  onPress={handleSubmit} 
  variant="primary" // or "secondary"
  disabled={false}
/>
```

## Platform Utils

The package also provides utility functions for platform-specific code:

```tsx
import { isPlatform } from "@knicks-knacks/ui";

if (isPlatform("web")) {
  // Web-specific code
} else {
  // Native-specific code
}
```

## Adding New Components

When adding new components:

1. Create the component in `src/components/`
2. Export it in `src/index.tsx`
3. For components with significant platform differences:
   - Use `Platform.OS === "web"` for conditional rendering
   - For more complex components, consider using the `PlatformComponent` type
