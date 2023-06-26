import {createContext, useState} from "react";
import {Message} from "@/lib/validators/message";
import {nanoid} from "nanoid";

export const MessagesContext = createContext<{
    messages: Message[],
    isMessageUpdating: boolean,
    addMessage: (message: Message) => void,
    removeMessage: (id: string) => void,
    // we use a function to update the message so we can append piece by piece, e.g.
    // (prev) => prev + chunk;
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void,
    setIsMessageUpdating: (isUpdating: boolean) => void,
}>({
    messages: [],
    isMessageUpdating: false,
    addMessage: () => {
    },
    removeMessage: () => {
    },
    updateMessage: () => {
    },
    setIsMessageUpdating: () => {
    }
});

export function MessagesProvider({children}: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([
            {
                id: nanoid(),
                text: 'Hello, how can I help you?',
                isUserMessage: false,

            }
        ]);
    const [isMessageUpdating, setIsMessageUpdating] = useState(false);

    const addMessage = (message: Message) => setMessages(prev=>[...prev, message]);
    const removeMessage = (id: string) => setMessages(prev => prev.filter(message => message.id !== id));

    const updateMessage = (id: string, updateFn: (prevText: string) => string) => {
        setMessages((prev) => prev.map(message=>{
            if (message.id === id) {
                return {
                    ...message,
                    text: updateFn(message.text)
                }
            }
            return message;
        }));
    }

    return <MessagesContext.Provider value={{
        messages,
        isMessageUpdating,
        setIsMessageUpdating,
        addMessage,
        removeMessage,
        updateMessage,
    }}>{children}</MessagesContext.Provider>
}