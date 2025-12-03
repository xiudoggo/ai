import { create } from "zustand";
import { Mask } from "./Mask";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

import { ChatMessage, useSessionStore, formatDateTime } from "./Session";



//const { addMessage, LocalMessages, loadMessages } = useSessionStore();
/**
 * 此接口主要用于调用deepseek接口,然后返回结果
 * 用户输入的message,除了上传给deepseek接口外，还要上传给后端保存
 * 上传给后端的函数已经实现: Session/addMessage
 * 
 * 接口返回的message,除了保存到数据库外，还要返回给前端
 */

const { addMessage } = useSessionStore.getState();




export interface ChatStore {
    AI_returned_message: ChatMessage;
    submitMessage: (message: ChatMessage) => Promise<void>;
    //GetandProcessMessage: () => {};
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            AI_returned_message: {
                role: "assistant",
                content: "",
                id: "",
                date: "",
                sessionId: "",
            },
            submitMessage: async (message: ChatMessage) => {
                // 动态获取当前会话ID和系统消息
                const { currentSessionId } = useSessionStore.getState();
                const { LocalSessions } = useSessionStore.getState();
                const currentSession = LocalSessions.find((s) => s.id === currentSessionId);
                const systemMessage = currentSession?.mask?.description ?? "You are a helpful assistant.";

                return fetch(process.env.NEXT_PUBLIC_AI_API_URL + "/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + process.env.NEXT_PUBLIC_USER_KEY,
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            {
                                role: "system",
                                content: systemMessage
                            },
                            {
                                role: "user",
                                content: message.content
                            }
                        ],
                        stream: false
                    })
                })
                    .then((res) => {
                        return res.json();
                    })
                    .then((data) => {
                        console.log(data);
                        const newMessage: ChatMessage = {
                            role: data.choices[0].message.role,
                            content: data.choices[0].message.content,
                            id: nanoid(),
                            date: new Date().toISOString(),
                            sessionId: currentSessionId!,
                        }
                        console.log(currentSessionId);
                        addMessage(newMessage, currentSessionId!, formatDateTime(new Date()));
                        set((state) => ({
                            AI_returned_message: newMessage
                        }));
                    }).catch((error) => {
                        console.error(error);
                        set((state) => ({
                            AI_returned_message: { ...state.AI_returned_message, content: "抱歉，我在处理您的请求时遇到了问题。" }
                        }));
                    })
            },

        }),
        {
            name: "chat-store"
        }
    )
)