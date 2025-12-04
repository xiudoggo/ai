import { useNavigate } from "react-router-dom";
import styles from "../css/Sidebar.module.scss";
import { useSessionStore } from "../stores/Session";
import { useEffect, useState } from "react";

export function ChatList() {
    const navigate = useNavigate();
    const { LocalSessions, loadSessions, removeSession, updateSessionName, setCurrentSession,loadMessages } = useSessionStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string>('');
    const [newName, setNewName] = useState('');

    const handleDelete = (e: React.MouseEvent,id: string) => {
        e.stopPropagation(); // 阻止事件冒泡
        removeSession(id);
        //loadSessions();
        navigate("/");
    };

    const handleEdit = (e: React.MouseEvent, id: string, currentName: string) => {
        e.stopPropagation(); // 阻止事件冒泡
        setEditingSessionId(id);
        setNewName(currentName);
        setIsEditing(true);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (newName.trim() && editingSessionId) {
            updateSessionName(editingSessionId, newName.trim());
        }
        setIsEditing(false);
        setEditingSessionId('');
        setNewName('');
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
        setEditingSessionId('');
        setNewName('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave(e as any);
        } else if (e.key === 'Escape') {
            handleCancel(e as any);
        }
    };

    const handleSessionClick = (id: string) => {
        //console.log("click session:", id);
        setCurrentSession(id);
        loadMessages(id);
        navigate("/chat");   
    };

    useEffect(() => {
        loadSessions();
    }, []);
    return (
        <div className={styles.chatList}>
            {LocalSessions.map(session => (
                <div
                    key={session.id}
                    className={styles.chatItem}
                    onClick={() => handleSessionClick(session.id)}
                >
                    <div className={styles.sessionName}>
                        {isEditing && editingSessionId === session.id ? (
                            <div className={styles.editContainer}>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                    className={styles.editInput}
                                />
                                <div className={styles.editActions}>
                                    <div className={styles.saveIcon} onClick={handleSave}>✓</div>
                                    <div className={styles.cancelIcon} onClick={handleCancel}>✕</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {session.topic}
                                <div className={styles.actions}>
                                    <div
                                        className={styles.editIcon}
                                        onClick={(e: React.MouseEvent) => handleEdit(e, session.id, session.topic)}
                                    >
                                        ✎
                                    </div>
                                    <div
                                        className={styles.deleteIcon}
                                        onClick={(e: React.MouseEvent) => handleDelete(e, session.id)}
                                    >
                                        ×
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={styles.info}>

                        <span>{session.messages?.length || 0}条消息</span>
                        <span>{session.lastUpdate}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}