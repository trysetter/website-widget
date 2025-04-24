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
    baseUrl?: string;
}
declare class ChatbotWidget {
    private container;
    private shadow;
    private config;
    private chatWindow;
    private chatButton;
    private isOpen;
    private resizeHandler;
    private hasValidConfig;
    private hideBranding;
    private configFetched;
    constructor(config?: ChatbotWidgetConfig);
    private initializeAsync;
    private fetchConfiguration;
    private injectStyles;
    private createButton;
    private createChatWindow;
    private handleClick;
    private adjustForToolbars;
    private handleResize;
    show(): void;
    hide(): void;
    openChat(): void;
    closeChat(): void;
    destroy(): void;
}
export default ChatbotWidget;
