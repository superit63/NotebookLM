/**
 * Chat Message Component
 * Displays a single message with markdown and citations
 */

'use client';

import ReactMarkdown from 'react-markdown';

interface Citation {
    sourceId?: string;
    sourceName?: string;
    source?: string;
    excerpt?: string;
}

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    citations?: string;
    timestamp?: string;
}

export function ChatMessage({ role, content, citations, timestamp }: ChatMessageProps) {
    const isUser = role === 'user';

    // Parse citations if present
    let parsedCitations: Citation[] = [];
    if (citations) {
        try {
            parsedCitations = JSON.parse(citations);
        } catch {
            // Invalid JSON, ignore
        }
    }

    return (
        <div
            className={`mb-4 message-enter ${isUser ? 'flex justify-end' : ''}`}
        >
            <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}
            >
                {/* Message Content */}
                {isUser ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                ) : (
                    <div className="markdown-content prose prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                // Custom link renderer to open in new tab
                                a: ({ node, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" />
                                ),
                                // Custom code block
                                code: ({ node, className, children, ...props }) => {
                                    const isInline = !className;
                                    return isInline ? (
                                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}

                {/* Citations */}
                {parsedCitations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Nguồn tham khảo:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {parsedCitations.map((citation, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg text-xs text-gray-600 transition-colors cursor-default"
                                    title={citation.excerpt}
                                >
                                    [{index + 1}] {citation.sourceName || citation.source || 'Unknown'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                {timestamp && (
                    <p className={`text-xs mt-2 ${isUser ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Typing Indicator Component
 */
export function TypingIndicator() {
    return (
        <div className="mb-4 message-enter">
            <div className="max-w-3xl rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            </div>
        </div>
    );
}
