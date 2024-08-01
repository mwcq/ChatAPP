import React from "react";
import styled from "styled-components";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "./../../../../lib/userStore";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const AddUserContainer = styled.div`
  width: max-content;
  height: max-content;
  padding: 30px;
  background-color: rgba(17, 25, 40, 0.6);
  border-radius: 10px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  form {
    display: flex;
    gap: 20px;
    input {
      padding: 20px;
      border-radius: 10px;
      border: none;
      outline: none;
    }
    button {
      padding: 20px;
      border-radius: 10px;
      background-color: #1e90ff;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
  .user {
    margin-top: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .detail {
      display: flex;
      gap: 20px;
      align-items: center;
      img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    button {
      padding: 10px;
      border-radius: 10px;
      background-color: #1e90ff;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
`;

export default function index() {
  const [user, setUser] = React.useState(null);
  const { currentUser } = useUserStore();
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AddUserContainer>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="用户昵称" name="username" />
        <button>搜索</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>添加用户</button>
        </div>
      )}
    </AddUserContainer>
  );
}
