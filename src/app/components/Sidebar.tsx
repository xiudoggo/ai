import styles from "../css/Sidebar.module.scss";
import { useNavigate } from "react-router-dom";
import ChatGptIcon from "../icons/chatgpt.svg";
import { ChatList } from "./ChatList";
import { useSessionStore } from "../stores/Session";



export default function Sidebar() {
    const navigate = useNavigate();
    const { setCurrentSession } = useSessionStore();

    const handleNewChat = () => {
        setCurrentSession(null);
        navigate("/");
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <span className={styles.title}>NextChat</span>
                <div className={styles.icon}>
                    <ChatGptIcon />
                </div>
                <div className={styles.subtitle}>
                    Build your own AI assistant.
                </div>
            </div>
            <button
                className={styles.newChat}
                onClick={handleNewChat}>
                + 新建聊天
            </button>

            <ChatList />
        </div>
    );
}