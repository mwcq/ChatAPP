import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => {
    return {
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        changeChat: (chatId, user) => {
            const currentUser = useUserStore.getState().currentUser;
            // 检查当前用户是否被对方拉黑
            if (user.blocked.includes(currentUser.id)) {
                return set({
                    chatId,
                    user: null,
                    isCurrentUserBlocked: true,
                    isReceiverBlocked: false,
                })
            }
            // 检查接受者是否被当前用户拉黑
            else if (currentUser.blocked.includes(user.id)) {
                return set({
                    chatId,
                    user,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: true,
                })
            } else {
                return set({
                    chatId,
                    user,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: false,
                })
            }

        },
        changeBlock: () => {
            set(state => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
        }
    }
})