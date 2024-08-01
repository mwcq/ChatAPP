import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useUserStore = create((set) => {
    return {
        currentUser: null,
        isLoding: true,
        fetchUserInfo: async (uid) => {
            if (!uid) return set({ currentUser: null, isLoding: false });

            try {
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    set({ currentUser: docSnap.data(), isLoding: false });
                } else {
                    set({ currentUser: null, isLoding: false });
                }
            } catch (error) {
                console.log(error);
                return set({ currentUser: null, isLoding: false });
            }
        }
    }
})