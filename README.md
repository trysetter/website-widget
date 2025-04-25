# Chatbot Widget

A lightweight, customizable chatbot widget that can be embedded into any website. Built with TypeScript and Shadow DOM for style isolation.

## Features

- Floating chat button in the bottom right corner
- Expandable chat window with iframe support
- Style isolation using Shadow DOM (won't conflict with existing site styles)
- Customizable colors, positions, and sizes
- Smooth animations and transitionsw

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
    import ChatbotWidget from 'https://cdn.jsdelivr.net/gh/trysetter/website-widget@releases/chatbot-widget.js';
    
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
        },
        botIntegrationId: '29' // Specify which bot integration to use
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
    botIntegraionId?: string; // ID of the bot integration to use
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

## Release Process

To create a new release:

1. Make changes on the `main` branch
2. Determine the next version number following semantic versioning principles (check `git tag` to see last releases)
3. Push changes to `main`
4. Wait for GitHub Actions to complete the build process for the `releases` branch
5. Create a tag with the new version for the commit on the `releases` branch:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0: brief description of changes"
   git push origin v1.0.0
   ```
6. Purge the jsDelivr URL cache for the `releases` branch
7. Verify changes are reflected on:
   - The jsDelivr URL for the `releases` branch: `https://cdn.jsdelivr.net/gh/trysetter/website-widget@releases/chatbot-widget.js`
   - The version-specific URL: `https://cdn.jsdelivr.net/gh/trysetter/website-widget@v1.0.0/chatbot-widget.js`
