// route.ts is a reserved file name
// the exported function must have the name of the http verb

// This is executed server side by node, so we can do security checks here
import {MessageArraySchema} from "@/lib/validators/message";
import {ChatGPTMessage, OpenAIStream, OpenAIStreamPayload} from "@/lib/openai-stream";
import {chatbotPrompt} from "@/helpers/chatbot-prompts";

export async function POST(req: Request) {
    const {messages} = await req.json();

    const parsedMessages = MessageArraySchema.parse(messages);

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message)=>{
        return {
            role: message.isUserMessage ? 'user' : 'system', // as defined by openAI
            content: message.text
        };
    });

    // add the main (first) prompt to the messagelist to brief chatGPT
    outboundMessages.unshift({
        role: 'system',
        content: chatbotPrompt
    });

    const payload: OpenAIStreamPayload = {
        model: 'gpt-3.5-turbo',
        messages: outboundMessages,
        temperature: 0.4, // how "creative" the chatbot is (randomness)
        top_p: 1, // diversity
        frequency_penalty: 0, // penalize repeating tokens, decreases likelihood of repeating same line immediately
        presence_penalty: 0, // penalize repeating stuff that already exists in the generated text (not necessarily on the same line)
        max_tokens: 150, // one token is ~ 4 characters for english text
        stream: true,
        n: 1, // ?
    }

    //console.log(payload);

    const stream = await OpenAIStream(payload);
    return new Response(stream);
}