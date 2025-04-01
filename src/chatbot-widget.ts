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
                /* Use a more conservative height calculation */
                height: calc(100vh - env(safe-area-inset-top, 50px));
                bottom: 0;
                right: 0;
                border-radius: 0;
                max-height: none;
                margin-top: env(safe-area-inset-top, 50px);
                position: fixed;
                top: 0;
                /* Remove padding-bottom that was pushing content down */
                box-sizing: border-box;
                /* Ensure window is always on top */
                z-index: 2147483647;
                /* Remove any unwanted space */
                padding: 0;
            }

            .chatbot-window.open {
                display: flex;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .chatbot-window-header {
                display: none;
            }

            .chatbot-window.mobile .chatbot-window-header {
                display: none;
            }

            .chatbot-close-btn {
                display: none;
            }

            /* Don't hide floating button when chat window is open on mobile */
            @media (max-width: 480px) {
                .chatbot-window.mobile.open + .chatbot-widget-button {
                    display: flex;
                }
            }

            .chatbot-iframe {
                flex: 1;
                width: 100%;
                border: none;
                background: white;
                /* Remove bottom padding from iframe */
                padding: 0;
                margin: 0;
            }

            .chatbot-footer {
                padding: 8px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                background: #f9f9f9;
                /* Ensure footer stays above Safari toolbar */
                position: relative;
                z-index: 1;
                /* Simplify padding */
                padding-bottom: 8px;
                margin: 0;
            }

            .chatbot-footer a {
                color: ${this.config.colors?.primary};
                text-decoration: none;
                font-weight: 500;
            }

            .chatbot-footer a:hover {
                text-decoration: underline;
            }

            .chatbot-window.ios-safari {
                /* Modified height calculation for iOS Safari */
                height: calc(100vh - 50px);
                /* Create space at the bottom using padding on the container instead */
                padding-bottom: 0;
            }

            /* Adjust mobile window to make space for the button */
            @media (max-width: 480px) {
                .chatbot-window.mobile {
                    height: calc(100vh - 90px - env(safe-area-inset-top, 50px));
                    max-height: calc(100% - 90px); /* Ensure it doesn't overflow viewport */
                    bottom: 90px; /* Space for button + some padding */
                    padding: 0;
                }
                
                .chatbot-widget-button {
                    z-index: 2147483648; /* Ensure button is above window */
                    /* Ensure the button stays visible regardless of toolbars */
                    position: fixed !important;
                    bottom: calc(env(safe-area-inset-bottom, 0px) + 15px) !important; /* Add extra padding above toolbar */
                }
                
                .chatbot-iframe {
                    padding: 0;
                    margin: 0;
                }
                
                .chatbot-footer {
                    margin: 0;
                    border-radius: 0;
                }
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
                    padding: 0;
                    box-sizing: border-box;
                    border-radius: 12px 12px 0 0; /* Rounded corners at top */
                }
                
                .chatbot-window.ios-safari {
                    /* A better approach is to handle this with iframe and footer styling */
                    padding-bottom: 0;
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
        
        // Add viewport meta tag for proper mobile rendering if not already present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewportMeta);
        }
        
        // Check if iOS to add additional meta tag for fixed positioning issues
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS && !document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
            const metaApple = document.createElement('meta');
            metaApple.name = 'apple-mobile-web-app-capable';
            metaApple.content = 'yes';
            document.head.appendChild(metaApple);
            
            const metaAppleStatus = document.createElement('meta');
            metaAppleStatus.name = 'apple-mobile-web-app-status-bar-style';
            metaAppleStatus.content = 'black-translucent';
            document.head.appendChild(metaAppleStatus);
        }
        
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
            
            // Add event listener for viewport changes (like toolbar appearance)
            window.addEventListener('resize', this.adjustForToolbars.bind(this));
            // Initial adjustment for toolbars
            this.adjustForToolbars();
        } else {
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
            
            // Remove event listener when chat is closed
            window.removeEventListener('resize', this.adjustForToolbars.bind(this));
        }
    }

    private adjustForToolbars(): void {
        if (!this.chatWindow || !this.chatButton) return;
        
        // Get actual viewport height (this changes when toolbars appear/disappear)
        const viewportHeight = window.innerHeight;
        const isMobile = window.matchMedia('(max-width: 480px)').matches;
        
        if (isMobile && this.isOpen) {
            // Ensure button is visible by positioning it relative to current viewport
            if (this.chatButton) {
                const buttonHeight = this.chatButton.offsetHeight;
                // Include additional bottom padding to stay above toolbar
                const buttonBottom = parseInt(this.config.position?.bottom || '20px', 10) + 15;
                
                // Update window height and position to accommodate toolbars
                this.chatWindow.style.height = `calc(${viewportHeight}px - ${buttonHeight + buttonBottom + 10}px - env(safe-area-inset-top, 50px))`;
                this.chatWindow.style.bottom = `${buttonHeight + buttonBottom + 10}px`;
                
                // Ensure button has padding from bottom
                this.chatButton.style.bottom = `calc(env(safe-area-inset-bottom, 0px) + 15px)`;
            }
        } else {
            // Reset custom styles when not in mobile view
            this.chatWindow.style.height = '';
            this.chatWindow.style.bottom = '';
            if (this.chatButton) {
                this.chatButton.style.bottom = this.config.position?.bottom || '20px';
            }
        }
    }

    private handleResize(): void {
        // Skip if chat window doesn't exist
        if (!this.chatWindow) return;

        // Check if we're on a very small screen (mobile)
        const isMobile = window.matchMedia('(max-width: 480px) and (max-height: 750px)').matches;
        
        // Check if Safari on iOS
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isMobile) {
            this.chatWindow.classList.add('mobile');
            
            // Add extra class for Safari on iOS to handle toolbar differently
            if (isSafari && isIOS) {
                this.chatWindow.classList.add('ios-safari');
                
                // For iOS Safari, adjust only necessary elements
                if (this.isOpen) {
                    // Find the iframe and footer elements
                    const iframe = this.chatWindow.querySelector('.chatbot-iframe');
                    const footer = this.chatWindow.querySelector('.chatbot-footer');
                    
                    if (iframe && footer) {
                        // Remove any padding from iframe
                        (iframe as HTMLElement).style.paddingBottom = '0';
                        // Ensure footer is visible above the toolbar
                        (footer as HTMLElement).style.position = 'relative';
                        (footer as HTMLElement).style.zIndex = '2';
                        (footer as HTMLElement).style.paddingBottom = '8px';
                    }
                    
                    // Ensure adjustment for toolbars happens after iOS specific handling
                    this.adjustForToolbars();
                }
            } else {
                // For non-Safari mobile browsers, still adjust for toolbars
                if (this.isOpen) {
                    this.adjustForToolbars();
                }
            }
        } else {
            this.chatWindow.classList.remove('mobile');
            this.chatWindow.classList.remove('ios-safari');
            this.chatWindow.style.paddingBottom = '';
            
            // Reset iframe and footer styles
            const iframe = this.chatWindow.querySelector('.chatbot-iframe');
            const footer = this.chatWindow.querySelector('.chatbot-footer');
            
            if (iframe) {
                (iframe as HTMLElement).style.paddingBottom = '';
            }
            
            if (footer) {
                (footer as HTMLElement).style.position = '';
                (footer as HTMLElement).style.zIndex = '';
                (footer as HTMLElement).style.paddingBottom = '8px';
            }
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
            
            // Add toolbar adjustment event listener and initial adjustment
            window.addEventListener('resize', this.adjustForToolbars.bind(this));
            this.adjustForToolbars();
        }
    }

    public closeChat(): void {
        if (this.chatWindow && this.chatButton) {
            this.isOpen = false;
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
            
            // Remove toolbar event listener
            window.removeEventListener('resize', this.adjustForToolbars.bind(this));
            
            // Reset button position
            this.chatButton.style.bottom = this.config.position?.bottom || '20px';
        }
    }

    // Clean up event listeners when widget is destroyed
    public destroy(): void {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // Remove toolbar adjustment listener if it exists
        window.removeEventListener('resize', this.adjustForToolbars.bind(this));

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Create and export the widget instance
export default ChatbotWidget; 