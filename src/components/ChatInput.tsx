"use client"

import React, {HTMLAttributes, useState} from 'react';
import {cn} from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize'
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {nanoid} from "nanoid";
import {sendMessage} from "next/dist/client/dev/error-overlay/websocket";
import {Message} from "@/lib/validators/message";

interface ChatInputPropsType extends HTMLAttributes<HTMLDivElement> {}

export const ChatInput = ({className, ...props}: ChatInputPropsType) => {
    const {mutate: sendMessage, data, error, isError, isLoading} = useMutation({
        mutationKey: ['sendMessage'],
        mutationFn: async (message: Message)=>{

            console.log(message)
            const response = await fetch('/api/message',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [message],
                    })
                });
            console.log("xxx"+response);
            return response.body;
        },
        onSuccess: ()=> {
            console.log('success');
        },
        onError: error => {
            console.log(error);
        }
    });

    const [input, setInput] = useState('');
    return (<div {...props} className={cn('border-t border-zinc-300', className)}>
        <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none">
            <TextareaAutosize
                value={input}
                onKeyDown={(e)=>{
                    if(e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();

                        const message: Message = {
                            // https://www.npmjs.com/package/nanoid - creates random secure IDs
                            id: nanoid(),
                            isUserMessage: true,
                            text: input
                        }

                        sendMessage(message)
                    }
                }}
                onChange={event => setInput(event.target.value)}
                rows={2}
                maxRows={4}
                autoFocus={true}
                placeholder={'Write a message...'}
                className='peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6'

            />
        </div>
    </div>);
};
