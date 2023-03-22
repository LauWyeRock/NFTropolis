import React, { useEffect, useState, useContext } from "react";

//INTERNAL IMPORT
// import { ChatAppContect } from "../Context/ChatAppContext";
import { Filter2, Friend, NavBar2 } from "../Components/componentsindex";

const ChatApp = () => {
  // const {} = useContext(ChatAppContect);
  return (
    <div>
      <NavBar2 />
      <Filter2 />
      <Friend />
    </div>
  );
};

export default ChatApp;