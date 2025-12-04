import styles from '../css/Mask.module.scss';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/Session';
import { Mask, useMaskStore } from '../stores/Mask';

import { useEffect, useState } from 'react';

interface MaskFormProps {
    title: string;
    name: string;
    context: string;
    onNameChange: (value: string) => void;
    onContextChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText: string;
    cancelText: string;
}

const MaskForm = ({  name, context, onNameChange, onContextChange, onConfirm, onCancel, confirmText, cancelText }: MaskFormProps) => {
    return (
        <div className={styles.createMaskForm}>
            <input
                type="text"
                placeholder="面具名称"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className={styles.maskInput}
            />
            <textarea
                placeholder="提示词（系统会根据这个提示词来塑造AI的行为）"
                value={context}
                onChange={(e) => onContextChange(e.target.value)}
                className={styles.maskTextarea}
            />
            <div className={styles.formActions}>
                <button
                    onClick={onConfirm}
                    className={styles.confirmButton}
                >
                    {confirmText}
                </button>
                <button
                    onClick={onCancel}
                    className={styles.cancelButton}
                >
                    {cancelText}
                </button>
            </div>
        </div>
    );
};

export default function Masks() {
    const navigate = useNavigate();
    const { addSession,currentSessionId,setCurrentSession } = useSessionStore();
    const { LocalMasks, getMasks, addMask, removeMask, updateMask } = useMaskStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newMaskName, setNewMaskName] = useState('');
    const [newMaskContext, setNewMaskContext] = useState('');
    const [editMask, setEditMask] = useState<{ id: string | null; name: string; context: string }>({
        id: null,
        name: '',
        context: ''
    });

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

    const beginEditMask = (mask: Mask, e: React.MouseEvent) => {
        
        e.stopPropagation();
        setEditMask({
            id: mask.id,
            name: mask.name,
            context: mask.description
        });
        setShowCreateForm(false);
        console.log(mask.id);
    };

    const handleUpdateMask = () => {
        
        if (!editMask.id) return;
        if (editMask.name.trim() && editMask.context.trim()) {
            updateMask(editMask.id, editMask.name, editMask.context);
            setEditMask({ id: null, name: '', context: '' });
        }
    };

    const cancelEdit = () => {
        setEditMask({ id: null, name: '', context: '' });
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
                {!showCreateForm && !editMask.id && LocalMasks.map((mask) => (
                    <div key={mask.id} className={styles.maskItemWrapper}>
                        <button
                            type="button"
                            className={styles.buttonItem}
                            onClick={() => handleMaskSelect(mask)}
                        >
                            {mask.name}
                        </button>
                        <div className={styles.maskActionButtons}>
                            <button
                                className={styles.editMaskButton}
                                onClick={(e) => beginEditMask(mask, e)}
                            >
                                ✎
                            </button>
                            <button
                                className={styles.deleteMaskButton}
                                onClick={(e) => handleDeleteMask(mask.id, e)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {showCreateForm ? (
                    <MaskForm
                        title="创建新面具"
                        name={newMaskName}
                        context={newMaskContext}
                        onNameChange={setNewMaskName}
                        onContextChange={setNewMaskContext}
                        onConfirm={handleCreateMask}
                        onCancel={() => setShowCreateForm(false)}
                        confirmText="确认"
                        cancelText="取消"
                    />
                ) : null}

                {editMask.id ? (
                    <MaskForm
                        title="编辑面具"
                        name={editMask.name}
                        context={editMask.context}
                        onNameChange={(value) => setEditMask(prev => ({ ...prev, name: value }))}
                        onContextChange={(value) => setEditMask(prev => ({ ...prev, context: value }))}
                        onConfirm={handleUpdateMask}
                        onCancel={cancelEdit}
                        confirmText="保存"
                        cancelText="取消"
                    />
                ) : null}
            </div>

            {!showCreateForm && !editMask.id && (
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
