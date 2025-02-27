# Chatbot Widget

A lightweight, customizable chatbot widget that can be embedded into any website. Built with TypeScript and Shadow DOM for style isolation.

## Features

- Floating chat button in the bottom right corner
- Expandable chat window with iframe support
- Style isolation using Shadow DOM (won't conflict with existing site styles)
- Customizable colors, positions, and sizes
- Smooth animations and transitions

## Installation

```bash
# Install dependencies
npm install

# Build the widget
npm run build
```

## Usage

Include the compiled script in your HTML:

```html
<script type="module">
    import ChatbotWidget from './dist/chatbot-widget.js';
    
    // Initialize with default settings
    const chatbot = new ChatbotWidget();
    
    // Or with custom settings
    const chatbot = new ChatbotWidget({
        colors: {
            primary: '#0084ff',
            iconFill: 'white'
        },
        position: {
            bottom: '20px',
            right: '20px'
        },
        size: {
            width: '60px',
            height: '60px'
        }
    });
</script>
```

## Development

```bash
# Start development server with auto-reloading
npm start
```

The development server will watch for changes and automatically reload the browser.

## Customization

The widget can be customized via the configuration object:

```typescript
interface ChatbotWidgetConfig {
    position?: {
        bottom?: string;
        right?: string;
    };
    colors?: {
        primary?: string;
        iconFill?: string;
    };
    size?: {
        width?: string;
        height?: string;
    };
}
```

## API

The widget instance provides methods for external control:

```javascript
// Show/hide widget entirely
chatbot.show();
chatbot.hide();

// Open/close chat window
chatbot.openChat();
chatbot.closeChat();
```
