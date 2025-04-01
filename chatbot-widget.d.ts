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
declare class ChatbotWidget {
    private container;
    private shadow;
    private config;
    private chatWindow;
    private chatButton;
    private isOpen;
    private resizeHandler;
    constructor(config?: ChatbotWidgetConfig);
    private initialize;
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
