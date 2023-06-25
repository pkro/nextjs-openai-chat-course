// convention enforced by openai
import {ReadableStream} from "stream/web";
import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
    role: ChatGPTAgent;
    content: string;
}

export interface OpenAIStreamPayload {
    top_p: number;
    frequency_penalty: number;
    max_tokens: number;
    stream: boolean;
    presence_penalty: number;
    temperature: number;
    messages: ChatGPTMessage[];
    model: string;
    n: number
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
    // The TextEncoder interface takes a stream of code points as input and emits a stream of UTF-8 bytes.
    // standard JS functionality
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let counter = 0;
    // console.log("K"+process.env.OPENAI_API_KEY); key is there
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    console.log(res); // always 429, too many requests

    // turn the openAI stream into actual text
    // if we didn't use stream: true in the openAI request payload, we'd get a normal full JSON
    // this is just to show the output of openAI "as it types"


    // ReadableStream is a standard JS class
    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    const stream = new ReadableStream({
        async start(controller) {
            // https://github.com/rexxars/eventsource-parser
            // You create an instance of the parser, and feed it chunks of data - partial or complete,
            // and the parse emits parsed messages once it receives a complete message.
            // the types come from eventsource-parser
            function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === 'event') {
                    const data = event.data;
                    console.log(data)

                    // [DONE] is sent by the openai api when the stream is over
                    // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                    if (data === '[DONE]') {
                        controller.close();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        console.log(json);
                        const text = json.choices[0].delta?.content || '';
                        console.log(text);

                        // if counter < 2 and no new lines in the text, ignore
                        // why?
                        if (counter < 2 && (text.match(/\n/) || []).length === 0) {
                            return;
                        }

                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                        counter++;
                    } catch (error) {
                        console.log(error);
                        controller.error(error);
                    }
                }
            }

            // createParser comes from eventsource-parser lib
            const parser = createParser(onParse);

            for await(const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        }
    });

    return stream;
}