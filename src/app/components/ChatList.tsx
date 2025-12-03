import { useNavigate } from "react-router-dom";
import styles from "../css/Sidebar.module.scss";
import DeleteIcon from "../icons/delete.svg";
import { useSessionStore } from "../stores/Session";
import { useEffect } from "react";

export function ChatList() {
    const navigate = useNavigate();
    const { LocalSessions, loadSessions, removeSession, setCurrentSession,loadMessages } = useSessionStore();

    const handleDelete = (e: React.MouseEvent,id: string) => {
        e.stopPropagation(); // 阻止事件冒泡
        removeSession(id);
        //loadSessions();
        navigate("/");
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
                        {session.topic}
                        <DeleteIcon
                            className={styles.deleteIcon}
                            onClick={(e: React.MouseEvent) => handleDelete(e,session.id)}
                        />
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