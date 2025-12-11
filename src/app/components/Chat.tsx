import { useNavigate } from "react-router-dom";
import styles from '../css/Chat.module.scss';
import { ChatMessage, formatDateTime, useSessionStore } from "../stores/Session";
import { useState, useEffect, useRef } from 'react';
import { nanoid } from "nanoid";
import { useChatStore } from "../stores/ChatMessage";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';
import LoadingIcon from "../icons/loading.svg";

export default function Chat() {
    const navigate = useNavigate();
    const { LocalSessions, currentSessionId, addMessage, LocalMessages, loadMessages,setCurrentSession } = useSessionStore();
    const [inputValue, setInputValue] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { submitMessage } = useChatStore();
    // 字符限制
    const MAX_CHARACTERS = 20000;

    // 获取当前会话
    const currentSession = LocalSessions.find(session => session.id === currentSessionId);

    // 当切换会话时从 store 加载消息（loadMessages 会返回按时间排序的 LocalMessages）
    useEffect(() => {
        if (currentSessionId) {
            loadMessages(currentSessionId);
            
        }
    }, [currentSessionId, loadMessages]);

    // 使用 store 中的 LocalMessages（已经由 loadMessages 排序）
    const currentMessages = LocalMessages || [];

    // 添加状态来跟踪是否正在等待AI回复
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

    // 发送消息
    const handleSendMessage = () => {
        if (inputValue.trim() !== '') {
            const newMessage: ChatMessage = {
                role: 'user',
                content: inputValue,
                id: nanoid(),
                date: new Date().toISOString(),
                sessionId: currentSessionId!,
            };
            addMessage(newMessage, currentSessionId!, formatDateTime(new Date()));

            // 设置等待状态为true
            setIsWaitingForResponse(true);

            // 提交消息并在完成后重置等待状态
            submitMessage(newMessage).finally(() => {
                setIsWaitingForResponse(false);
            });
            setInputValue('');
        }
        console.log(currentSessionId);

    };

    // 处理回车发送消息（Shift+Enter换行）
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // 滚动到底部
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [currentMessages]);

    // 处理输入变化，限制字符数
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARACTERS) {
            setInputValue(value);
        }
    };

    //处理返回按钮
    const handleBackClick = () => {
        setCurrentSession(null);
        navigate('/');

    };
    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <button
                    onClick={handleBackClick}
                    className={styles.backButton}
                >
                    返回
                </button>
                <div className={styles.chatTitle}>
                    {currentSession ? currentSession.topic : 'AI Assistant'}
                </div>
            </div>

            <div
                className={styles.messagesContainer}
                ref={messagesContainerRef}
            >
                {currentMessages.map((message) => (
                    <div
                        key={message.id}
                        className={styles.messageBubble}
                    >
                        <div
                            className={
                                message.role === 'user'
                                    ? styles.userMessage
                                    : styles.assistantMessage
                            }
                        >
                            {message.content ? (
                                <ReactMarkdown remarkPlugins={[gfm]}>{message.content}</ReactMarkdown>
                            ) : null}
                        </div>

                    </div>
                ))
                }
            </div>

            {/* 在输入框上方居中显示loading图标 */}
            {isWaitingForResponse && (
                <div className={styles.loadingContainer}>
                    Waiting for response
                    <LoadingIcon  viewBox="0 0 16 16"/>
                </div>
            )}

            <div className={styles.inputContainer}>
                <div className={styles.textareaWrapper}>
                    <textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="请输入消息..."
                        autoFocus={true}
                        className={styles.messageInput}
                    ></textarea>
                    <div className={styles.characterCount}>
                        {inputValue.length}/{MAX_CHARACTERS}
                    </div>
                </div>
                <button
                    onClick={handleSendMessage}
                    className={styles.sendButton}
                >
                    发送
                </button>
            </div>
        </div>
    );
}