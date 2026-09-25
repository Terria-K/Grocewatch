import { createContext, useContext, useState } from "react";
import { MessageRole } from "react-native-gemma-agent";

export type ChatMessageType = {
    message: string,
    role: MessageRole
}

const MessageContext = createContext({
    messages: [],
    reload: () => {},
} as MessageProviderContext);

export type MessageProviderContext = {
    messages: ChatMessageType[],
    reload: () => void,
}

type MessageProviderProps = {
    children: React.ReactNode
}

export function MessageProvider({ children }: MessageProviderProps) {
    const [messages, setMessages] = useState<ChatMessageType[]>([])

    const reload = () => setMessages(messages);

    return (
        <MessageContext.Provider value={{ messages, reload }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessage() {
    return useContext(MessageContext);
}
