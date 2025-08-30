"use client";

import React from "react";
import Image from "next/image";

type UploadValue = {
    url: string;
    alt?: string;
    [key: string]: unknown;
};

type RichTextNode = {
    type?: string;
    children?: RichTextNode[];
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    url?: string;
    value?: UploadValue;
    relationTo?: string;
};

export function RenderRichText({ content }: { content: RichTextNode[] }) {
    if (!content) return null;

    return (
        <>
            {content.map((node, i) => {
                // Plain text
                if (node.text) {
                    let el: React.ReactNode = node.text;

                    if (node.bold) el = <strong key={i}>{el}</strong>;
                    if (node.italic) el = <em key={i}>{el}</em>;
                    if (node.underline) el = <u key={i}>{el}</u>;

                    return <React.Fragment key={i}>{el}</React.Fragment>;
                }

                // Headings
                if (node.type === "h1")
                    return (
                        <h1 key={i} className="text-3xl font-bold mb-4">
                            <RenderRichText content={node.children || []} />
                        </h1>
                    );

                if (node.type === "h2")
                    return (
                        <h2 key={i} className="text-2xl font-semibold mb-3">
                            <RenderRichText content={node.children || []} />
                        </h2>
                    );

                // Links
                if (node.type === "link" && node.url)
                    return (
                        <a
                            key={i}
                            href={node.url}
                            className="text-emerald-400 underline hover:text-emerald-300"
                        >
                            <RenderRichText content={node.children || []} />
                        </a>
                    );

                // Inline uploads (images from Payload Media collection)
                if (node.type === "upload" && node.value?.url) {
                    const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
                    const imgUrl = `${CMS_URL}${node.value.url}`;
                    return (
                        <Image
                            key={i}
                            src={imgUrl}
                            alt={node.value.alt || ""}
                            width={800}
                            height={600}
                            className="my-6 rounded-xl shadow-lg"
                        />
                    );
                }

                // Default: paragraph
                return (
                    <p key={i} className="mb-4">
                        <RenderRichText content={node.children || []} />
                    </p>
                );
            })}
        </>
    );
}
