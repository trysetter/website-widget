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

class ChatbotWidget {
    private container!: HTMLDivElement;
    private shadow!: ShadowRoot;
    private config: ChatbotWidgetConfig;

    constructor(config: ChatbotWidgetConfig = {}) {
        this.config = {
            position: {
                bottom: '20px',
                right: '20px',
                ...config.position
            },
            colors: {
                primary: '#0084ff',
                iconFill: 'white',
                ...config.colors
            },
            size: {
                width: '60px',
                height: '60px',
                ...config.size
            }
        };

        this.initialize();
    }

    private initialize(): void {
        // Create container element
        this.container = document.createElement('div');
        this.container.id = 'chatbot-widget-container';
        
        // Create and attach shadow DOM
        this.shadow = this.container.attachShadow({ mode: 'open' });

        // Add styles and button
        this.injectStyles();
        this.createButton();

        // Add the container to the page
        document.body.appendChild(this.container);
    }

    private injectStyles(): void {
        const styles = document.createElement('style');
        styles.textContent = `
            .chatbot-widget-button {
                position: fixed;
                bottom: ${this.config.position?.bottom};
                right: ${this.config.position?.right};
                width: ${this.config.size?.width};
                height: ${this.config.size?.height};
                border-radius: 50%;
                background-color: ${this.config.colors?.primary};
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease;
                z-index: 9999;
                border: none;
                padding: 0;
                margin: 0;
                /* Reset any inherited styles */
                font-size: 16px;
                line-height: 1;
                color: ${this.config.colors?.iconFill};
                text-decoration: none;
                box-sizing: border-box;
            }

            .chatbot-widget-button:hover {
                transform: scale(1.05);
            }

            .chatbot-widget-button svg {
                width: 32px;
                height: 32px;
                fill: ${this.config.colors?.iconFill};
            }
        `;

        this.shadow.appendChild(styles);
    }

    private createButton(): void {
        const chatButton = document.createElement('div');
        chatButton.className = 'chatbot-widget-button';
        
        // Add chat icon SVG
        chatButton.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
        `;

        // Add click event listener
        chatButton.addEventListener('click', this.handleClick.bind(this));

        this.shadow.appendChild(chatButton);
    }

    private handleClick(): void {
        // TODO: This will be implemented later to open the chatbot iframe
        console.log('Chatbot button clicked');
    }

    // Public methods for external control
    public show(): void {
        this.container.style.display = 'block';
    }

    public hide(): void {
        this.container.style.display = 'none';
    }
}

// Create and export the widget instance
export default ChatbotWidget; 