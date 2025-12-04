import { create } from "zustand";
import { Mask } from "./Mask";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";


export type ChatMessage = {
    role: string;
    content: string;
    id: string;
    date: string;
    sessionId: string;
}

export type Session = {
    id: string;
    createTime: string;
    lastUpdate: string;
    topic: string;
    messages: ChatMessage[];
    mask?: Mask; //实际只需maskid
}

export interface SessionState {
    LocalSessions: Session[];
    currentSessionId: string | null;
    loadSessions: () => void;
    addSession: (mask: Mask) => void;
    removeSession: (id: string) => void;
    updateSessionName: (id: string, newName: string) => void;
    setCurrentSession: (id: string | null) => void;
    addMessage: (message: ChatMessage, sessionId: string, UpdateTime: string) => void;
    loadMessages: (id: string) => void;
    LocalMessages: ChatMessage[];
    // 已经排序过的 sessionId 列表，用来避免重复排序
    sortedSessions: string[];
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

export function formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 将消息按 date 字段升序排序（旧在前，最新在后）
function sortMessages(msgs: ChatMessage[]): ChatMessage[] {
    return [...msgs].sort((a, b) => {
        const ta = Date.parse(a.date);
        const tb = Date.parse(b.date);
        if (isNaN(ta) && isNaN(tb)) return 0;
        if (isNaN(ta)) return -1;
        if (isNaN(tb)) return 1;
        return ta - tb;
    });
}

export const useSessionStore = create<SessionState>()(

    persist(
        (set, get) => ({
            LocalMessages: [],
            LocalSessions: [],
            sortedSessions: [],
            currentSessionId: null,
            loadSessions: async () => {
                await fetch("http://localhost:8080/session/all")
                    .then((res) => {
                        return res.json();
                    }).then((LoadedSessions: Session[]) => {
                        // 加载所有 session 时清空排序标记，确保新数据需要重新排序
                        set((state) => ({
                            LocalSessions: LoadedSessions,
                            sortedSessions: []
                        }));
                    })
                    .catch((e) => {
                        console.error(e);
                    })
            },
            addSession: async (mask: Mask) => {
                const now = new Date();
                const session: Session = {
                    id: nanoid(),
                    createTime: formatDate(now),
                    lastUpdate: formatDateTime(now),
                    topic: mask.name,
                    messages: [],
                    mask: mask //实际只需maskid
                };
                console.log("Creating session:", session); // 调试信息

                await fetch("http://localhost:8080/session/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(session)
                })
                    .then((res) => {
                        return res.text();
                    })
                    .then((responseText) => {
                        console.log(responseText);
                        set((state) => ({
                            LocalSessions: [session, ...state.LocalSessions],
                            currentSessionId: session.id
                        }));
                        console.log("Current session:", get().currentSessionId);
                    })
                    .catch((e) => {
                        console.error(e);
                    })
            },
            removeSession: async (id: string) => {
                await fetch(`http://localhost:8080/session/delete?id=${id}`, {
                    method: "POST"
                })
                    .then((res) => res.text())
                    .then((result) => {
                        if (result === "Deleted") {
                            console.log("Session deleted successfully");
                        } else {
                            console.error("Failed to delete session");
                            return;
                        }
                        set((state) => ({
                            LocalSessions: state.LocalSessions.filter((session) => session.id !== id)
                        }));
                    })
                    .catch((e) => {
                        console.error("Failed to delete session:", e);
                    });
            },
            
            updateSessionName: async (id: string, newName: string) => {
                await fetch(`http://localhost:8080/session/update?id=${id}&name=${newName}`, {
                    method: "POST"
                })
                    .then((res) => res.text())
                    .then((result) => {
                        if (result === "Updated") {
                            console.log("Session updated successfully");
                            // 更新本地状态，确保界面能够正确刷新
                            set((state) => ({
                                LocalSessions: state.LocalSessions.map((session) => 
                                    session.id === id 
                                        ? { ...session, topic: newName }
                                        : session
                                )
                            }));
                        } else {
                            console.error("Failed to update session");
                        }
                    })
                    .catch((e) => {
                        console.error("Error updating session:", e);
                    })
            },
            setCurrentSession(id) {
                set({ currentSessionId: id });
                console.log("Current Session_id:", get().currentSessionId);
            },
            addMessage: async (message: ChatMessage, sessionId: string, UpdateTime: string) => {
                await fetch(`http://localhost:8080/session/message/add?sessionId=${sessionId}&UpdateTime=${UpdateTime}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(message)
                })
                    .then((res) => res.text())
                    .then((result) => {
                        console.log(result);
                        set((state) => {
                            // 找到并更新对应的 session
                            let updatedSession: Session | undefined;
                            const mapped = state.LocalSessions.map(session => {
                                if (session.id === sessionId) {
                                    updatedSession = {
                                        ...session,
                                        messages: [...(session.messages || []), message],
                                        lastUpdate: UpdateTime
                                    };
                                    return updatedSession;
                                }
                                return session;
                            });
                            // 将该会话移动到首位（如果找到）
                            const newLocalSessions = updatedSession
                                ? [updatedSession, ...mapped.filter(s => s.id !== sessionId)]
                                : mapped;

                            // 如果当前 sessionId 是本次添加的，更新并按时间排序 LocalMessages
                            let newLocalMessages = state.LocalMessages;
                            if (state.currentSessionId === sessionId) {
                                const msgs = updatedSession ? updatedSession.messages : (state.LocalMessages || []);
                                // 优化：如果本地消息最后一条时间不晚于新消息时间，直接追加，避免每次都排序。
                                const last = (state.LocalMessages && state.LocalMessages[state.LocalMessages.length - 1]);
                                const newMsg = msgs[msgs.length - 1];
                                const lastT = last ? Date.parse(last.date) : NaN;
                                const newT = newMsg ? Date.parse(newMsg.date) : NaN;
                                if (!isNaN(lastT) && !isNaN(newT) && lastT <= newT) {
                                    newLocalMessages = [...(state.LocalMessages || []), newMsg];
                                } else {
                                    // 回退到排序以保证顺序正确（处理时钟不同步或后到旧消息场景）
                                    newLocalMessages = sortMessages(msgs);
                                }
                            }

                            return {
                                LocalSessions: newLocalSessions,
                                LocalMessages: newLocalMessages
                            };
                        });
                    });
            },
            loadMessages: async (sessionId: string) => {
                set((state) => {
                    const sessionIndex = state.LocalSessions.findIndex(s => s.id === sessionId);
                    if (sessionIndex === -1) return { LocalMessages: [] };
                    const session = state.LocalSessions[sessionIndex];
                    // 如果已经排序过，则直接返回缓存的 messages
                    if (state.sortedSessions.includes(sessionId)) {
                        return { LocalMessages: session.messages || [] };
                    }
                    if (!session || !session.messages) {
                        return { LocalMessages: [] };
                    }
                    // 仅第一次对该 session 进行排序并缓存回 LocalSessions
                    const sorted = sortMessages(session.messages);
                    const updatedSessions = [...state.LocalSessions];
                    updatedSessions[sessionIndex] = { ...session, messages: sorted };
                    return {
                        LocalMessages: sorted,
                        LocalSessions: updatedSessions,
                        sortedSessions: [...state.sortedSessions, sessionId]
                    };
                });
            }
        }),
        { name: "session-storage" }
    )
)
