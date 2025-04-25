var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DEFAULT_BASE_URL = 'https://chat.trysetter.com';
class ChatbotWidget {
    constructor(config = {}) {
        var _a;
        this.chatWindow = null;
        this.chatButton = null;
        this.isOpen = false;
        this.resizeHandler = null;
        this.hasValidConfig = false;
        this.hideBranding = false;
        this.configFetched = false;
        if (!config.botIntegrationId) {
            console.error(`[Setter AI] Website widget: 'botIntegrationId' is required for initialization`);
            this.hasValidConfig = false;
        }
        else {
            this.hasValidConfig = true;
        }
        this.config = {
            position: Object.assign({ bottom: '20px', right: '20px' }, config.position),
            colors: Object.assign({ primary: '#0084ff', iconFill: 'white' }, config.colors),
            size: Object.assign({ width: '60px', height: '60px' }, config.size),
            botIntegrationId: config.botIntegrationId,
            baseUrl: (_a = config.baseUrl) !== null && _a !== void 0 ? _a : DEFAULT_BASE_URL,
        };
        if (this.hasValidConfig) {
            this.initializeAsync();
        }
    }
    initializeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create container element
            this.container = document.createElement('div');
            this.container.id = 'chatbot-widget-container';
            // Fetch configuration from API
            yield this.fetchConfiguration();
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
        });
    }
    fetchConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.botIntegrationId || !this.config.baseUrl)
                return;
            const url = `${this.config.baseUrl}/api/v1/bot-integrations/${this.config.botIntegrationId}/website-widget/configuration`;
            const errorHandler = (error) => {
                console.error('[Setter AI] Failed to fetch configuration:', error);
                // Proceed with default settings
                this.configFetched = true;
            };
            try {
                const response = yield fetch(url);
                if (!response.ok) {
                    errorHandler(new Error(`HTTP error! status: ${response.status}`));
                    return;
                }
                const data = yield response.json();
                // Update config with fetched values
                if (data && data.data) {
                    this.hideBranding = data.data.hideBranding;
                }
                this.configFetched = true;
            }
            catch (error) {
                errorHandler(error);
            }
        });
    }
    injectStyles() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const styleId = 'chatbot-widget-styles';
        // Remove existing style if it exists
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            #chatbot-widget-container .chatbot-widget-button {
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

            #chatbot-widget-container .chatbot-widget-button:hover {
                transform: scale(1.05);
            }

            #chatbot-widget-container .chatbot-widget-button svg {
                width: 32px;
                height: 32px;
                fill: ${(_g = this.config.colors) === null || _g === void 0 ? void 0 : _g.iconFill};
                transition: opacity 0.3s ease, transform 0.3s ease;
            }

            #chatbot-widget-container .chatbot-widget-button .chat-icon,
            #chatbot-widget-container .chatbot-widget-button .close-icon {
                position: absolute;
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }

            #chatbot-widget-container .chatbot-widget-button .close-icon {
                opacity: 0;
                transform: rotate(-180deg) scale(0.5);
            }

            #chatbot-widget-container .chatbot-widget-button.open .chat-icon {
                opacity: 0;
                transform: rotate(180deg) scale(0.5);
            }

            #chatbot-widget-container .chatbot-widget-button.open .close-icon {
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }

            #chatbot-widget-container .chatbot-window {
                position: fixed;
                bottom: calc(${(_h = this.config.position) === null || _h === void 0 ? void 0 : _h.bottom} + 70px);
                right: ${(_j = this.config.position) === null || _j === void 0 ? void 0 : _j.right};
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

            #chatbot-widget-container .dev-mode-label {
                position: absolute;
                top: 10px;
                left: 10px;
                background-color: #FF5722;
                color: white;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                z-index: 10;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                pointer-events: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            #chatbot-widget-container .chatbot-window.mobile {
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

            #chatbot-widget-container .chatbot-window.open {
                display: flex;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            #chatbot-widget-container .chatbot-window-header {
                display: none;
            }

            #chatbot-widget-container .chatbot-window.mobile .chatbot-window-header {
                display: none;
            }

            #chatbot-widget-container .chatbot-close-btn {
                display: none;
            }

            /* Don't hide floating button when chat window is open on mobile */
            @media (max-width: 480px) {
                #chatbot-widget-container .chatbot-window.mobile.open + .chatbot-widget-button {
                    display: flex;
                }
            }

            #chatbot-widget-container .chatbot-iframe {
                flex: 1;
                width: 100%;
                border: none;
                background: white;
                /* Remove bottom padding from iframe */
                padding: 0;
                margin: 0;
            }

            #chatbot-widget-container .chatbot-footer {
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

            #chatbot-widget-container .chatbot-footer a {
                color: ${(_k = this.config.colors) === null || _k === void 0 ? void 0 : _k.primary};
                text-decoration: none;
                font-weight: 500;
            }

            #chatbot-widget-container .chatbot-footer a:hover {
                text-decoration: underline;
            }

            #chatbot-widget-container .chatbot-window.ios-safari {
                /* Modified height calculation for iOS Safari */
                height: calc(100vh - 50px);
                /* Create space at the bottom using padding on the container instead */
                padding-bottom: 0;
            }

            /* Adjust mobile window to make space for the button */
            @media (max-width: 480px) {
                #chatbot-widget-container .chatbot-window.mobile {
                    height: calc(100vh - 90px - env(safe-area-inset-top, 50px));
                    max-height: calc(100% - 90px); /* Ensure it doesn't overflow viewport */
                    bottom: 90px; /* Space for button + some padding */
                    padding: 0;
                }
                
                #chatbot-widget-container .chatbot-widget-button {
                    z-index: 2147483648; /* Ensure button is above window */
                    /* Ensure the button stays visible regardless of toolbars */
                    position: fixed !important;
                    bottom: calc(env(safe-area-inset-bottom, 0px) + 15px) !important; /* Add extra padding above toolbar */
                }
                
                #chatbot-widget-container .chatbot-iframe {
                    padding: 0;
                    margin: 0;
                }
                
                #chatbot-widget-container .chatbot-footer {
                    margin: 0;
                    border-radius: 0;
                }
            }

            /* Responsive styles */
            @media (max-width: 768px) {
                #chatbot-widget-container .chatbot-window:not(.mobile) {
                    width: 90%;
                    right: 5%;
                    bottom: calc(${(_l = this.config.position) === null || _l === void 0 ? void 0 : _l.bottom} + 70px);
                    height: 60vh;
                }
            }

            @media (max-width: 480px) {
                #chatbot-widget-container .chatbot-window:not(.mobile) {
                    width: calc(100% - 20px);
                    right: 10px;
                    left: 10px;
                    bottom: calc(${(_m = this.config.position) === null || _m === void 0 ? void 0 : _m.bottom} + 70px);
                    height: 70vh;
                    border-radius: 12px 12px 0 0;
                }
                
                #chatbot-widget-container .chatbot-window.mobile {
                    width: 100%;
                    padding: 0;
                    box-sizing: border-box;
                    border-radius: 12px 12px 0 0; /* Rounded corners at top */
                }
                
                #chatbot-widget-container .chatbot-window.ios-safari {
                    /* A better approach is to handle this with iframe and footer styling */
                    padding-bottom: 0;
                }
            }
        `;
        document.head.appendChild(styles);
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
        this.container.appendChild(chatButton);
    }
    createChatWindow() {
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
        iframe.src = `${this.config.baseUrl}/p/embed/${this.config.botIntegrationId}/chat`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'microphone; camera');
        // Create dev mode label if custom base URL is used
        if (this.config.baseUrl !== DEFAULT_BASE_URL) {
            const devModeLabel = document.createElement('div');
            devModeLabel.className = 'dev-mode-label';
            devModeLabel.textContent = 'DEV MODE';
            chatWindow.appendChild(devModeLabel);
        }
        // Append iframe to chat window
        chatWindow.appendChild(iframe);
        // Create footer with backlink only if hideBranding is false
        if (!this.hideBranding) {
            const footer = document.createElement('div');
            footer.className = 'chatbot-footer';
            const analyticsParams = new URLSearchParams({
                utm_source: 'chat_widget',
                utm_medium: 'referral',
                utm_campaign: 'powered_by',
                ref: window.location.hostname
            });
            footer.innerHTML = `Powered by <a href="https://trysetter.com/?${analyticsParams.toString()}" target="_blank" rel="noopener">Setter AI</a>`;
            chatWindow.appendChild(footer);
        }
        // Store reference to chat window
        this.chatWindow = chatWindow;
        this.container.appendChild(chatWindow);
    }
    handleClick() {
        if (!this.chatWindow || !this.chatButton)
            return;
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.chatButton.classList.add('open');
            this.handleResize(); // Ensure correct sizing when opening
            // Add event listener for viewport changes (like toolbar appearance)
            window.addEventListener('resize', this.adjustForToolbars.bind(this));
            // Initial adjustment for toolbars
            this.adjustForToolbars();
        }
        else {
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
            // Remove event listener when chat is closed
            window.removeEventListener('resize', this.adjustForToolbars.bind(this));
        }
    }
    adjustForToolbars() {
        var _a, _b;
        if (!this.chatWindow || !this.chatButton)
            return;
        // Get actual viewport height (this changes when toolbars appear/disappear)
        const viewportHeight = window.innerHeight;
        const isMobile = window.matchMedia('(max-width: 480px)').matches;
        if (isMobile && this.isOpen) {
            // Ensure button is visible by positioning it relative to current viewport
            if (this.chatButton) {
                const buttonHeight = this.chatButton.offsetHeight;
                // Include additional bottom padding to stay above toolbar
                const buttonBottom = parseInt(((_a = this.config.position) === null || _a === void 0 ? void 0 : _a.bottom) || '20px', 10) + 15;
                // Update window height and position to accommodate toolbars
                this.chatWindow.style.height = `calc(${viewportHeight}px - ${buttonHeight + buttonBottom + 10}px - env(safe-area-inset-top, 50px))`;
                this.chatWindow.style.bottom = `${buttonHeight + buttonBottom + 10}px`;
                // Ensure button has padding from bottom
                this.chatButton.style.bottom = `calc(env(safe-area-inset-bottom, 0px) + 15px)`;
            }
        }
        else {
            // Reset custom styles when not in mobile view
            this.chatWindow.style.height = '';
            this.chatWindow.style.bottom = '';
            if (this.chatButton) {
                this.chatButton.style.bottom = ((_b = this.config.position) === null || _b === void 0 ? void 0 : _b.bottom) || '20px';
            }
        }
    }
    handleResize() {
        // Skip if chat window doesn't exist
        if (!this.chatWindow)
            return;
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
                        iframe.style.paddingBottom = '0';
                        // Ensure footer is visible above the toolbar
                        footer.style.position = 'relative';
                        footer.style.zIndex = '2';
                        footer.style.paddingBottom = '8px';
                    }
                    // Ensure adjustment for toolbars happens after iOS specific handling
                    this.adjustForToolbars();
                }
            }
            else {
                // For non-Safari mobile browsers, still adjust for toolbars
                if (this.isOpen) {
                    this.adjustForToolbars();
                }
            }
        }
        else {
            this.chatWindow.classList.remove('mobile');
            this.chatWindow.classList.remove('ios-safari');
            this.chatWindow.style.paddingBottom = '';
            // Reset iframe and footer styles
            const iframe = this.chatWindow.querySelector('.chatbot-iframe');
            const footer = this.chatWindow.querySelector('.chatbot-footer');
            if (iframe) {
                iframe.style.paddingBottom = '';
            }
            if (footer) {
                footer.style.position = '';
                footer.style.zIndex = '';
                footer.style.paddingBottom = '8px';
            }
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
            this.handleResize(); // Ensure correct sizing when opening
            // Add toolbar adjustment event listener and initial adjustment
            window.addEventListener('resize', this.adjustForToolbars.bind(this));
            this.adjustForToolbars();
        }
    }
    closeChat() {
        var _a;
        if (this.chatWindow && this.chatButton) {
            this.isOpen = false;
            this.chatWindow.classList.remove('open');
            this.chatButton.classList.remove('open');
            // Remove toolbar event listener
            window.removeEventListener('resize', this.adjustForToolbars.bind(this));
            // Reset button position
            this.chatButton.style.bottom = ((_a = this.config.position) === null || _a === void 0 ? void 0 : _a.bottom) || '20px';
        }
    }
    // Clean up event listeners when widget is destroyed
    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        // Remove toolbar adjustment listener if it exists
        window.removeEventListener('resize', this.adjustForToolbars.bind(this));
        // Remove styles from head
        const styleElement = document.getElementById('chatbot-widget-styles');
        if (styleElement) {
            styleElement.remove();
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
// Create and export the widget instance
export default ChatbotWidget;
