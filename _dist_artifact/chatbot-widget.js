class ChatbotWidget {
    constructor(config = {}) {
        this.chatWindow = null;
        this.chatButton = null;
        this.isOpen = false;
        this.config = {
            position: Object.assign({ bottom: '20px', right: '20px' }, config.position),
            colors: Object.assign({ primary: '#0084ff', iconFill: 'white' }, config.colors),
            size: Object.assign({ width: '60px', height: '60px' }, config.size),
            botIntegrationId: config.botIntegrationId || '1' // Default to '1' if not provided
        };
        this.initialize();
    }
    initialize() {
        // Create container element
        this.container = document.createElement('div');
        this.container.id = 'chatbot-widget-container';
        // Create and attach shadow DOM
        this.shadow = this.container.attachShadow({ mode: 'open' });
        // Add styles and components
        this.injectStyles();
        this.createButton();
        this.createChatWindow();
        // Add the container to the page
        document.body.appendChild(this.container);
    }
    injectStyles() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const styles = document.createElement('style');
        styles.textContent = `
            .chatbot-widget-button {
                position: fixed;
                bottom: ${(_a = this.config.position) === null || _a === void 0 ? void 0 : _a.bottom};
                right: ${(_b = this.config.position) === null || _b === void 0 ? void 0 : _b.right};
                width: ${(_c = this.config.size) === null || _c === void 0 ? void 0 : _c.width};
                height: ${(_d = this.config.size) === null || _d === void 0 ? void 0 : _d.height};
                border-radius: 50%;
                background-color: ${(_e = this.config.colors) === null || _e === void 0 ? void 0 : _e.primary};
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
                color: ${(_f = this.config.colors) === null || _f === void 0 ? void 0 : _f.iconFill};
                text-decoration: none;
                box-sizing: border-box;
            }

            .chatbot-widget-button:hover {
                transform: scale(1.05);
            }

            .chatbot-widget-button svg {
                width: 32px;
                height: 32px;
                fill: ${(_g = this.config.colors) === null || _g === void 0 ? void 0 : _g.iconFill};
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
                bottom: calc(${(_h = this.config.position) === null || _h === void 0 ? void 0 : _h.bottom} + 70px);
                right: ${(_j = this.config.position) === null || _j === void 0 ? void 0 : _j.right};
                width: 450px;
                height: 800px;
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
                color: ${(_k = this.config.colors) === null || _k === void 0 ? void 0 : _k.primary};
                text-decoration: none;
                font-weight: 500;
            }

            .chatbot-footer a:hover {
                text-decoration: underline;
            }
        `;
        this.shadow.appendChild(styles);
    }
    createButton() {
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
    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        // Create iframe with dynamic botId
        const iframe = document.createElement('iframe');
        iframe.className = 'chatbot-iframe';
        iframe.src = `https://127.0.0.1:5173/p/embed/${this.config.botIntegrationId}/chat`;
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
    handleClick() {
        if (!this.chatWindow || !this.chatButton)
            return;
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.chatButton.classList.add('open');
        }
        else {
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
        }
    }
    // Public methods for external control
    show() {
        this.container.style.display = 'block';
    }
    hide() {
        this.container.style.display = 'none';
    }
    openChat() {
        if (this.chatWindow && this.chatButton) {
            this.isOpen = true;
            this.chatWindow.classList.add('open');
            this.chatButton.classList.add('open');
        }
    }
    closeChat() {
        if (this.chatWindow && this.chatButton) {
            this.isOpen = false;
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
        }
    }
}
// Create and export the widget instance
export default ChatbotWidget;
