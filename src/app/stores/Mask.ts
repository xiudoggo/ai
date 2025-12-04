import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义后端返回的 Mask 数据结构
type BackendMask = {
    id: number; // 后端使用 int 类型
    name: string;
    description: string;
}

export type Mask = {
    id: string; // 前端统一使用 string 类型
    name: string;
    description: string;
}



export interface MaskState {
    LocalMasks: Mask[];
    getMasks: () => void;
    addMask: (add_name: string, add_description: string) => void;
    removeMask: (id: string) => void;
    updateMask: (id: string, name: string, description: string) => void;
}

export const useMaskStore = create<MaskState>()(
    persist(
        (set, get) => ({
            LocalMasks: [],
            getMasks: () => {
                fetch("http://localhost:8080/mask/all")
                    .then((res) => {
                        return res.json();
                    }).then((databaseMasks: BackendMask[]) => {
                        // 将后端的 int 类型 id 转换为前端的 string 类型
                        const convertedMasks: Mask[] = databaseMasks.map(mask => ({
                            ...mask,
                            id: mask.id.toString()
                        }));
                        set((state) => ({
                            LocalMasks: convertedMasks
                        }));
                    })
                    .catch((e) => {
                        console.error(e);
                    })
            },
            addMask: (add_name: string, add_description: string) => {
                const convertedMask = {
                    name: add_name,
                    description: add_description
                };
                fetch("http://localhost:8080/mask/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(convertedMask)
                })
                    .then((res) => {
                        return res.json();
                    }).then((id: number) => {
                        // 后端返回的是int类型的id，需要转换为字符串并添加到LocalMasks中
                        const newMask = {
                            ...convertedMask,
                            id: id.toString() // 将int类型的id转换为string类型
                        };
                        set((state) => ({
                            LocalMasks: [...state.LocalMasks, newMask],
                        }));
                        console.log("Added mask with id:", id);
                    }).catch((e) => {
                        console.error(e);
                    })
            },
            removeMask: (id: string) => {
                const int_id: number = parseInt(id);
                fetch(`http://localhost:8080/mask/delete?id=${int_id}`, {
                    method: "POST"
                })
                    .then((res) => {
                        return res.text();
                    }).then((result) => {
                        if (result === "Deleted") {
                            console.log("Mask deleted successfully");
                            set((state) => ({
                                LocalMasks: state.LocalMasks.filter(mask => mask.id !== id),
                            }))
                        } else {
                            console.error("Failed to delete mask");
                            return;
                        }

                    })
            },
            updateMask: (id: string, name: string, description: string) => {
                const int_id: number = parseInt(id);
                fetch(`http://localhost:8080/mask/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: int_id,
                        name,
                        description
                    })
                })
                    .then((res) => res.text())
                    .then((result) => {
                        if (result === "Updated") {
                            set((state) => ({
                                LocalMasks: state.LocalMasks.map(m => m.id === id ? { ...m, name, description } : m)
                            }));
                        } else {
                            console.error("Failed to update mask");
                        }
                    })
            }

        }),
        {
            name: "mask-store",
            partialize: (state) => ({
                LocalMasks: state.LocalMasks
            }),
        }
    )
);
