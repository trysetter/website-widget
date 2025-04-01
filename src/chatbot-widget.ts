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
    botIntegrationId?: string;
}

class ChatbotWidget {
    private container!: HTMLDivElement;
    private shadow!: ShadowRoot;
    private config: ChatbotWidgetConfig;
    private chatWindow: HTMLDivElement | null = null;
    private chatButton: HTMLDivElement | null = null;
    private isOpen: boolean = false;
    private resizeHandler: (() => void) | null = null;

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
            },
            botIntegrationId: config.botIntegrationId || '1' // Default to '1' if not provided
        };

        this.initialize();
    }

    private initialize(): void {
        // Create container element
        this.container = document.createElement('div');
        this.container.id = 'chatbot-widget-container';
        
        // Create and attach shadow DOM
        this.shadow = this.container.attachShadow({ mode: 'open' });

        // Add styles and components
        this.injectStyles();
        this.createButton();
        this.createChatWindow();

        // Add window resize listener
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        
        // Initial resize handling
        this.handleResize();

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
                transition: opacity 0.3s ease, transform 0.3s ease;
            }

            .chatbot-widget-button .chat-icon,
            .chatbot-widget-button .close-icon {
                position: absolute;
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }

            .chatbot-widget-button .close-icon {
                opacity: 0;
                transform: rotate(-180deg) scale(0.5);
            }

            .chatbot-widget-button.open .chat-icon {
                opacity: 0;
                transform: rotate(180deg) scale(0.5);
            }

            .chatbot-widget-button.open .close-icon {
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }

            .chatbot-window {
                position: fixed;
                bottom: calc(${this.config.position?.bottom} + 70px);
                right: ${this.config.position?.right};
                width: 450px;
                height: 70vh;
                max-height: 800px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 9998;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: transform 0.2s ease, opacity 0.2s ease;
            }

            .chatbot-window.mobile {
                width: 100%;
                height: 100vh;
                bottom: 0;
                right: 0;
                border-radius: 0;
                max-height: none;
            }

            .chatbot-window.open {
                display: flex;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .chatbot-iframe {
                flex: 1;
                width: 100%;
                border: none;
                background: white;
            }

            .chatbot-footer {
                padding: 8px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                background: #f9f9f9;
            }

            .chatbot-footer a {
                color: ${this.config.colors?.primary};
                text-decoration: none;
                font-weight: 500;
            }

            .chatbot-footer a:hover {
                text-decoration: underline;
            }

            /* Responsive styles */
            @media (max-width: 768px) {
                .chatbot-window:not(.mobile) {
                    width: 90%;
                    right: 5%;
                    bottom: calc(${this.config.position?.bottom} + 70px);
                    height: 60vh;
                }
            }

            @media (max-width: 480px) {
                .chatbot-window:not(.mobile) {
                    width: calc(100% - 20px);
                    right: 10px;
                    left: 10px;
                    bottom: calc(${this.config.position?.bottom} + 70px);
                    height: 70vh;
                    border-radius: 12px 12px 0 0;
                }
                
                .chatbot-window.mobile {
                    width: 100%;
                    padding-left: 10px;
                    padding-right: 10px;
                    box-sizing: border-box;
                }
            }
        `;

        this.shadow.appendChild(styles);
    }

    private createButton(): void {
        const chatButton = document.createElement('div');
        chatButton.className = 'chatbot-widget-button';
        
        // Add chat and close icons
        chatButton.innerHTML = `
            <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;

        // Add click event listener
        chatButton.addEventListener('click', this.handleClick.bind(this));

        // Store reference to button
        this.chatButton = chatButton;
        this.shadow.appendChild(chatButton);
    }

    private createChatWindow(): void {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        
        // Create iframe with dynamic botId
        const iframe = document.createElement('iframe');
        iframe.className = 'chatbot-iframe';
        iframe.src = `https://chat.trysetter.com/p/embed/${this.config.botIntegrationId}/chat`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'microphone; camera');

        // Create footer with backlink
        const footer = document.createElement('div');
        footer.className = 'chatbot-footer';
        const analyticsParams = new URLSearchParams({
            utm_source: 'chat_widget',
            utm_medium: 'referral',
            utm_campaign: 'powered_by',
            ref: window.location.hostname
        });
        footer.innerHTML = `Powered by <a href="https://trysetter.com/?${analyticsParams.toString()}" target="_blank" rel="noopener">Setter AI</a>`;

        // Append components to chat window
        chatWindow.appendChild(iframe);
        chatWindow.appendChild(footer);
        
        // Store reference to chat window
        this.chatWindow = chatWindow;
        
        this.shadow.appendChild(chatWindow);
    }

    private handleClick(): void {
        if (!this.chatWindow || !this.chatButton) return;
        
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.chatButton.classList.add('open');
            this.handleResize(); // Ensure correct sizing when opening
        } else {
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
        }
    }

    private handleResize(): void {
        // Skip if chat window doesn't exist
        if (!this.chatWindow) return;

        // Check if we're on a very small screen (mobile)
        const isMobile = window.matchMedia('(max-width: 480px) and (max-height: 750px)').matches;
        
        if (isMobile) {
            this.chatWindow.classList.add('mobile');
        } else {
            this.chatWindow.classList.remove('mobile');
        }
    }

    // Public methods for external control
    public show(): void {
        this.container.style.display = 'block';
    }

    public hide(): void {
        this.container.style.display = 'none';
    }

    public openChat(): void {
        if (this.chatWindow && this.chatButton) {
            this.isOpen = true;
            this.chatWindow.classList.add('open');
            this.chatButton.classList.add('open');
            this.handleResize(); // Ensure correct sizing when opening
        }
    }

    public closeChat(): void {
        if (this.chatWindow && this.chatButton) {
            this.isOpen = false;
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
        }
    }

    // Clean up event listeners when widget is destroyed
    public destroy(): void {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Create and export the widget instance
export default ChatbotWidget; 