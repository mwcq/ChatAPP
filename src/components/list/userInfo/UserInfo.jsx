import React from "react";
import styled from "styled-components";
import { useUserStore } from "./../../../lib/userStore";

const UserInfoContainer = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Icons = styled.div`
  display: flex;
  gap: 20px;
  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
export default function UserInfo() {
  const { currentUser } = useUserStore();

  return (
    <UserInfoContainer>
      <User>
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </User>
      <Icons>
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </Icons>
    </UserInfoContainer>
  );
}
