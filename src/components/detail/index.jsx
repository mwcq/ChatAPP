import React from "react";
import "./detail.css";
import styled from "styled-components";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
const User = styled.div`
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #dddddd35;
  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
  }
`;
const Info = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;

  .option {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      img {
        width: 30px;
        height: 30px;
        background-color: rgba(17, 25, 40, 0.3);
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
      }
    }
    .photos {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
      .photoItem {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .photoDetail {
          display: flex;
          align-items: center;
          gap: 20px;
          img {
            width: 40px;
            height: 40px;
            border-radius: 5px;
            object-fit: cover;
          }
          span {
            font-size: 14px;
            color: lightgray;
            font-weight: 300;
          }
        }
        .icon {
          width: 30px;
          height: 30px;
          background-color: rgba(17, 25, 40, 0.3);
          border-radius: 50%;
          cursor: pointer;
          padding: 10px;
        }
      }
    }
  }
  button {
    padding: 15px;
    background-color: rgba(230, 74, 105, 0.553);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: rgba(230, 74, 105, 0.7);
    }
    &.logout {
      padding: 10px;
      background-color: #1a73e8;
    }
  }
`;
export default function index() {
  const { currentUser } = useUserStore();
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeChat,
    changeBlock,
  } = useChatStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <User>
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        {/* <p>Lorem ipsum dolor sit amet.</p> */}
      </User>
      <Info>
        <div className="option">
          <div className="title">
            <span>聊天设置</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>隐私&帮助</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>照片</span>
            <img src="./arrowUp.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>背景</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>背景</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>文件</span>
            <img src="./arrowDown.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "你已被对方屏蔽"
            : isReceiverBlocked
            ? "解除屏蔽"
            : "屏蔽"}
        </button>
        <button
          className="logout"
          onClick={() => {
            auth.signOut();
          }}
        >
          退出登录
        </button>
      </Info>
    </div>
  );
}
