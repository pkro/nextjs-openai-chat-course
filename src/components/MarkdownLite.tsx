import React from "react";
import Link from "next/link";

export function MarkdownLite({text}: { text: string }) {
    console.log(text);
    const linkRegex = /\[(.+?)\]\((.+?)\)/g;

    const parts = [];
    let lastIndex = 0;
    let match;
    // as we indicated /g, it will return matches bit by bit if there are more than one
    while ((match = linkRegex.exec(text)) !== null) {
        // exec returns an array with the full match and then each the text of each capture group indicated
        // by the paranthesis in the regex
        const [fullMatch, linkText, linkUrl] = match;
        // exec adds additional properties to the returned array object: index and input
        const matchStart = match.index; // just the string index
        const matchEnd = matchStart + fullMatch.length;
        if (lastIndex < matchStart) {
            parts.push(text.slice(lastIndex, matchStart));
        }

        parts.push(
            <Link target={'_blank'} rel={"noopener noreferrer"} className={'break-words underline underline-offset-2 text-blue'} key={linkUrl} href={linkUrl}>
                {linkText}
            </Link>
        );
        lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    // we use React.Fragment instead of <> so we can add a key
    return <>
        {parts.map((part, i) => (
            <React.Fragment key={i}>
            {part}
        </React.Fragment>))}
    </>;
}