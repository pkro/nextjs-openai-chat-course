"use client"

import React, {HTMLAttributes, useContext, useRef, useState} from 'react';
import {cn} from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize'
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {nanoid} from "nanoid";
import {sendMessage} from "next/dist/client/dev/error-overlay/websocket";
import {Message} from "@/lib/validators/message";
import {MessagesContext} from "@/context/messages";
import {CornerDownLeft, Loader2} from "lucide-react";
import toast, {Toaster} from "react-hot-toast";

interface ChatInputPropsType extends HTMLAttributes<HTMLDivElement> {
}

export const ChatInput = ({className, ...props}: ChatInputPropsType) => {
    const {
        messages,
        isMessageUpdating,
        setIsMessageUpdating,
        updateMessage,
        addMessage,
        removeMessage
    } = useContext(MessagesContext);
    const textInputRef = useRef<HTMLTextAreaElement | null>(null);

    const {mutate: sendMessage, data, error, isError, isLoading} = useMutation({
        mutationKey: ['sendMessage'],
        mutationFn: async (_message: Message) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({messages}),
            });
            if (!response.ok) {
                throw new Error();
            }
            return response.body;
        },
        onMutate(message) {
            addMessage(message);
        },
        onSuccess: async (stream) => {
            if (!stream) {
                throw new Error("no stream found");
            }
            const id = nanoid();
            const responseMessage: Message = {
                id,
                isUserMessage: false,
                text: ''
            }
            addMessage(responseMessage);
            setIsMessageUpdating(true);

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const {value, done: doneReading} = await reader.read();
                console.log("...")
                done = doneReading;
                const chunkValue = decoder.decode(value);
                updateMessage(id, prev => prev + chunkValue);
            }

            setIsMessageUpdating(false);
            setInput('');
            // timeout because for some reason it doesn't work if done directly
            // according to the video
            setTimeout(() => textInputRef.current?.focus(), 50);

        },
        onError: (error, message) => {
            toast.error('Something went wrong.');
            removeMessage(message.id);
            textInputRef.current?.focus();
        }
    });

    const [input, setInput] = useState('');
    return (<div {...props} className={cn('border-t border-zinc-300', className)}>
        <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none">
            <TextareaAutosize
                ref={textInputRef}
                value={input}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();

                        const message: Message = {
                            // https://www.npmjs.com/package/nanoid - creates random secure IDs
                            id: nanoid(),
                            isUserMessage: true,
                            text: input
                        }

                        // we do the addMessage in onMutate so we don't get race conditions
                        // and have the messages in the wrong order
                        sendMessage(message)
                    }
                }}
                onChange={event => setInput(event.target.value)}
                rows={2}
                maxRows={4}
                disabled={isLoading}
                autoFocus={true}
                placeholder={'Write a message...'}
                className='peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6'

            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd
                    className={'inline-flex items-center rounded border bg-white border-gray-200 px-1 text-xs text-gray-500 font-sans'}>
                    {isLoading ? <Loader2 className={'w-3 h-3 animate-spin'}/> :
                        <CornerDownLeft className={'w-3 h-3'}/>}
                </kbd>
            </div>
            <div aria-hidden={'true'} className={'absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600'}/>
            <Toaster />
        </div>
    </div>);
};
