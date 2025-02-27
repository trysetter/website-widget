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
    constructor(config?: ChatbotWidgetConfig);
    private initialize;
    private injectStyles;
    private createButton;
    private createChatWindow;
    private handleClick;
    show(): void;
    hide(): void;
    openChat(): void;
    closeChat(): void;
}
export default ChatbotWidget;
