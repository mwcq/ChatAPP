import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AddUser from "./addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-gutter: stable both-edges;
  &::-webkit-scrollbar {
    background-color: transparent;
    width: 13px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  .searchBar {
    flex: 1;
    background-color: rgba(17, 25, 40, 0.5);
    display: flex;
    align-items: center;
    gap: 20px;
    border-radius: 10px;
    padding: 10px;
    input {
      background-color: transparent;
      border: none;
      outline: none;
      color: white;
      flex: 1;
    }
    img {
      width: 20px;
      height: 20px;
    }
  }
  .add {
    width: 36px;
    height: 36px;
    background-color: rgba(17, 25, 40, 0.5);
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  cursor: pointer;
  border-bottom: 1px solid #6f6f6f;
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  span {
    font-weight: 500;
  }
  p {
    font-size: 14px;
    font-weight: 300;
  }
`;

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // setChats(doc.data().chats);
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);

        setChats(
          chatData.sort((a, b) => {
            return b.updatedAt - a.updatedAt;
          })
        );
      }
    );
    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <ChatListContainer>
      <Search>
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="搜索"
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />
        </div>
        <img
          onClick={() => {
            setAddMode(!addMode);
          }}
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
        />
      </Search>
      {filteredChats.map((chat) => (
        <Item
          key={chat.chatId}
          onClick={() => {
            handleSelect(chat);
          }}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <Texts>
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "屏蔽用户"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </Texts>
        </Item>
      ))}
      {addMode && <AddUser />}
    </ChatListContainer>
  );
}
