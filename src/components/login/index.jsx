import React from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 100px;
  .item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      justify-content: center;
      input {
        padding: 20px;
        border: none;
        outline: none;
        background-color: rgba(17, 25, 40, 0.6);
        color: white;
        border-radius: 5px;
      }
      label {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        text-decoration: underline;
        img {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          object-fit: cover;
          opacity: 0.6;
        }
      }
      button {
        width: 100%;
        padding: 20px;
        border: none;
        background-color: #1f8ef1;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        &:disabled {
          cursor: not-allowed;
          background-color: #1f8ff155;
        }
      }
    }
  }
  .separator {
    height: 80%;
    width: 2px;
    background-color: #dddddd35;
  }
`;

export default function Login() {
  const [avatar, setAvatar] = React.useState({
    file: null,
    url: "",
  });

  const [loding, setLoing] = React.useState(false);

  const handleAvatar = (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAvatar({ file, url });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoing(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("登陆成功");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoing(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoing(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("注册成功");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoing(false);
    }
  };

  return (
    <LoginContainer>
      <div className="item">
        <h2>欢迎，请登录</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="登录邮箱" name="email" />
          <input
            type="password"
            placeholder="登录密码"
            name="password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <button disabled={loding}>{loding ? "loding" : "登录"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>注册账号</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            上传你的头像
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="用户昵称" name="username" />
          <input type="text" placeholder="登录邮箱" name="email" />
          <input type="password" placeholder="登录密码" name="password" />
          <button disabled={loding}>{loding ? "loding" : "注册"}</button>
        </form>
      </div>
    </LoginContainer>
  );
}
