import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics.js";
import ChatLoading from "./ChatLoading.js";
import GroupChatModal from "./miscellaneous/GroupChatModal.js";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider.js";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [userStatuses, setUserStatuses] = useState({});
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const fetchUserStatuses = async () => {
    try {
      const { data } = await axios.get("/api/user/online-status");
      const statuses = {};
      data.forEach((user) => {
        statuses[user._id] = user.isOnline;
        // This line sets a key-value pair in the statuses object,
        //where the key is the user's ID and the value is the user's online status.
      });
      setUserStatuses(statuses);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load user statuses",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    fetchUserStatuses();
  }, [fetchAgain]);

  useEffect(() => {
    // Listen for the statusChanged event
    socket.on("statusChanged", ({ userId, isOnline }) => {
      setUserStatuses((prevStatuses) => ({
        ...prevStatuses,
        [userId]: isOnline,
      }));
    });

    // Cleanup on component unmount
    return () => {
      socket.off("statusChanged");
    };
  });

  const getSenderWithStatus = (loggedUser, users) => {
    const sender = getSender(loggedUser, users);
    const senderUser = users.find((user) => user._id !== loggedUser._id);
    const isOnline = userStatuses[senderUser._id] ? "Online" : "Offline";
    return `${sender} - (${isOnline})`;
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSenderWithStatus(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
