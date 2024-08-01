import React, { useState, useRef, useEffect } from "react";
import "./chat.css";
import styled from "styled-components";
import EmojiPicker from "emoji-picker-react";
import { db } from "../../lib/firebase";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Top = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dddddd35;
  .user {
    display: flex;
    align-items: center;
    gap: 20px;
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }
  }
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  span {
    font-size: 18px;
    font-weight: bold;
  }
  p {
    font-size: 14px;
    font-weight: 300;
    color: #a5a5a5;
  }
`;

const TopIcons = styled.div`
  display: flex;
  gap: 20px;
  img {
    width: 20px;
    height: 20px;
  }
`;

const Center = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-gutter: stable both-edges;
  &::-webkit-scrollbar {
    background-color: transparent;
    width: 13px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  .message {
    max-width: 70%;
    display: flex;
    gap: 20px;
  }
  .own {
    align-self: flex-end;
    .texts {
      p {
        background-color: #0084ff;
      }
    }
  }
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
  }
  .texts {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    img {
      width: 100%;
      height: 300px;
      border-radius: 10px;
      object-fit: cover;
    }
    p {
      padding: 20px;
      background-color: rgba(17, 25, 40, 0.3);
      border-radius: 10px;
    }
    span {
      font-size: 13px;
    }
  }
`;

const Bottom = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #dddddd35;
  gap: 20px;
  margin-bottom: auto;
  input {
    flex: 1;
    background-color: rgba(17, 25, 40, 0.5);
    border: none;
    outline: none;
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-size: 16px;
    &:disabled {
      cursor: not-allowed;
    }
  }
  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  .sendButton {
    background-color: #0084ff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
      background-color: #0084ff80;
      cursor: not-allowed;
    }
  }
`;
const Emoji = styled.div`
  position: relative;
  .picker {
    position: absolute;
    bottom: 50px;
    left: 0;
  }
`;
const BottomIcons = styled.div`
  display: flex;
  gap: 20px;
  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

export default function index() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const endRef = useRef(null);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleImg = (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setImg({ file, url });
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") {
      return;
    }

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          sendrId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    setImg({ file: null, url: "" });
    setText("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return "";
    }
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="chat">
      <Top>
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <Texts>
            <span>{user?.username}</span>
            {/* <p>Lorem ipsum dolor, sit amet.</p> */}
          </Texts>
        </div>
        <TopIcons>
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </TopIcons>
      </Top>
      <Center>
        {chat?.messages?.map((item) => (
          <div
            className={
              item.sendrId === currentUser?.id ? "message own" : "message"
            }
            key={item?.createdAt}
          >
            <div className="texts">
              {item.img && <img src={item.img} alt="" />}
              <p>{item.text}</p>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </Center>
      <Bottom>
        <BottomIcons>
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </BottomIcons>
        <input
          type="text"
          placeholder="输入消息..."
          onChange={(e) => {
            setText(e.target.value);
          }}
          value={text}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <Emoji>
          <img
            src="./emoji.png"
            alt=""
            onClick={() => {
              setOpen(!open);
            }}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji}></EmojiPicker>
          </div>
        </Emoji>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          发送
        </button>
      </Bottom>
    </div>
  );
}
