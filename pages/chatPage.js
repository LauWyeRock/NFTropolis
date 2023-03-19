import React, { useEffect, useState, useContext } from "react";

//INTERNAL IMPORT
// import { ChatAppContect } from "../Context/ChatAppContext";
import { Filter, Friend } from "../Components/componentsindex";

const ChatApp = () => {
  // const {} = useContext(ChatAppContect);
  return (
    <div>
      <Filter />
      <Friend />
    </div>
  );
};

export default ChatApp;