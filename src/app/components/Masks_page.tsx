import styles from '../css/Mask.module.scss';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/Session';
import { Mask, useMaskStore } from '../stores/Mask';

import { useEffect, useState } from 'react';

export default function Masks() {
    const navigate = useNavigate();
    const { addSession,currentSessionId,setCurrentSession } = useSessionStore();
    const { LocalMasks, getMasks, addMask, removeMask } = useMaskStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newMaskName, setNewMaskName] = useState('');
    const [newMaskContext, setNewMaskContext] = useState('');

    const handleMaskSelect = (mask: Mask) => {
        // 创建新会话
        addSession(mask);

        // 跳转到聊天页面
        navigate("/chat");
    };

    const handleCreateMask = () => {
        if (newMaskName.trim() && newMaskContext.trim()) {
            // 添加面具
            addMask(newMaskName, newMaskContext);
            setNewMaskName('');
            setNewMaskContext('');
            setShowCreateForm(false);
        }
    };

    const handleDeleteMask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeMask(id);
    };

    useEffect(() => {
        getMasks();
    }, []);

    return (
        <div className={styles.maskContainer}>
            <div className={styles.title}>
                <h1>挑选一个面具</h1>
                <p>现在开始，与面具背后的灵魂思维碰撞</p>
            </div>

            <div className={styles.buttonList}>
                {!showCreateForm && LocalMasks.map((mask) => (
                    <div key={mask.id} className={styles.maskItemWrapper}>
                        <button
                            type="button"
                            className={styles.buttonItem}
                            onClick={() => handleMaskSelect(mask)}
                        >
                            {mask.name}
                        </button>
                        <button
                            className={styles.deleteMaskButton}
                            onClick={(e) => handleDeleteMask(mask.id, e)}
                        >
                            ×
                        </button>
                    </div>
                ))}

                {showCreateForm ? (
                    <div className={styles.createMaskForm}>
                        <input
                            type="text"
                            placeholder="面具名称"
                            value={newMaskName}
                            onChange={(e) => setNewMaskName(e.target.value)}
                            className={styles.maskInput}
                        />
                        <textarea
                            placeholder="提示词（系统会根据这个提示词来塑造AI的行为）"
                            value={newMaskContext}
                            onChange={(e) => setNewMaskContext(e.target.value)}
                            className={styles.maskTextarea}
                        />
                        <div className={styles.formActions}>
                            <button
                                onClick={handleCreateMask}
                                className={styles.confirmButton}
                            >
                                确认
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className={styles.cancelButton}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {!showCreateForm && (
                <button
                    type="button"
                    className={styles.addMaskButton}
                    onClick={() => setShowCreateForm(true)}
                >
                    + 创建新面具
                </button>
            )}
        </div>
    );
}