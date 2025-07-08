import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import Avatar, { genConfig } from "react-nice-avatar";
import SendIcon from "@mui/icons-material/Send";

// Dummy data for users and messages
import usersData from "./dummyUsersData.json";
import messagesData from "./dummyMessagesData.json";

const ChatWindow = ({ isCollapsed }) => {
  const [users, setUsers] = useState(usersData);
  const [messages, setMessages] = useState(messagesData);
  const [newMessage, setNewMessage] = useState("");
  const [alignment, setAlignment] = useState("Convergent");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [aiSuggestedSpeaker, setAiSuggestedSpeaker] = useState("AI Researcher");

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const sender = { name: "You" }; // Fixed name for the user's own messages
    const newMessageObj = { sender, text: newMessage, isOwnMessage: true };
    setMessages([...messages, newMessageObj]);
    setNewMessage("");
  };

  const handleSpeakerSelect = (user) => {
    const updatedUsers = users.filter((u) => u.name !== user);
    const selectedUser = users.find((u) => u.name === user);
    // setUsers([selectedUser!, ...updatedUsers]);
    setTimeout(() => {
      setUsers([selectedUser!, ...updatedUsers]);
    }, 100);
    setSelectedSpeaker(user);
    setAiSuggestedSpeaker("");
  };

  const handleAiSuggestedSpeaker = (user) => {
    setAiSuggestedSpeaker(user);
    // Additional logic to handle AI-suggested speaker and API call to backend
  };

  const handleSummarize = () => {
    // Implement summarize function here
  };
  if (isCollapsed) {
    return null;
  }
  return (
    <Paper elevation={0} style={{ height: "100%", overflow: "auto" }}>
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={1}
        borderColor="divider"
        position="sticky"
        top={0}
        zIndex={1}
        bgcolor="white"
      >
        <Box display="flex" flexDirection="column">
          <Box display="flex">
            {users.map((user, index) => (
              <Tooltip title={user.name} key={index} placement="top" arrow>
                <div
                  key={index}
                  style={{
                    marginRight: "1rem",
                    borderRadius: "50%",
                    boxShadow: `${
                      user.name === selectedSpeaker
                        ? "0 0 0 4px #da8e00"
                        : "none"
                    }`,
                    cursor: "pointer",
                    animation: `${
                      user.name === aiSuggestedSpeaker ? "glow" : "none"
                    } 0.5s infinite alternate`,
                    transition: "all 0.3s ease-in-out",
                    transform: `${
                      user.name === selectedSpeaker ? "scale(1.1)" : "none"
                    }`,
                  }}
                  onClick={() => handleSpeakerSelect(user.name)}
                  // onMouseEnter={() => handleAiSuggestedSpeaker(user)}
                >
                  <Avatar
                    style={{ width: "2rem", height: "2rem" }}
                    {...genConfig(user.name)}
                  />
                </div>
              </Tooltip>
            ))}
          </Box>
          <style>{`
  @keyframes glow {
    0% {
      box-shadow: 0 0 5px rgba(255, 165, 0, 0.8), 0 0 10px rgba(255, 165, 0, 0.6), 0 0 15px rgba(255, 165, 0, 0.4), 0 0 20px rgba(255, 165, 0, 0.2);
    }
    50% {
      box-shadow: 0 0 10px rgba(255, 165, 0, 0.8), 0 0 20px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 165, 0, 0.4), 0 0 40px rgba(255, 165, 0, 0.2);
    }
    // 100% {
    //   box-shadow: 0 0 15px rgba(255, 165, 0, 0.8), 0 0 25px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 165, 0, 0.4), 0 0 60px rgba(255, 165, 0, 0.2);
    // }
  }
`}</style>

          <Typography
            variant="caption"
            display="block"
            align="left"
            className=" mt-4 text-gray-400"
          >
            Click on the avatar to select the speaker.
          </Typography>
        </Box>
        <ToggleButtonGroup
          color="warning"
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="conversationFlow"
          orientation="vertical"
          size="small"
        >
          <ToggleButton value="Convergent">Convergent</ToggleButton>
          <ToggleButton value="Divergent">Divergent</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box p={2} flexGrow={1} overflow="auto">
        <div style={{ maxHeight: "calc(100% - 120px)", overflowY: "auto" }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent={message.isOwnMessage ? "flex-end" : "flex-start"}
              mb={0}
            >
              {!message.isOwnMessage && (
                <Avatar
                  key={index}
                  style={{ width: "2rem", height: "2rem" }}
                  {...genConfig(message.sender.name)}
                />
              )}
              <Box
                bgcolor={message.isOwnMessage ? "rgba(230,126,34,0.8)" : ""}
                color={message.isOwnMessage ? "black" : "text.primary"}
                p={2}
                borderRadius="10px"
                maxWidth="70%"
                mb={0.5}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  // mb={0.5}
                  // textAlign={message.isOwnMessage ? "right" : "left"}
                >
                  {message.isOwnMessage ? "" : `${message.sender.name}:`}
                </Typography>
                <Typography variant="body">{message.text}</Typography>
              </Box>
            </Box>
          ))}
        </div>
      </Box>
      <Box
        p={2}
        display="flex"
        alignItems="center"
        borderTop={1}
        borderColor="divider"
        position="sticky"
        bottom={0}
        zIndex={1}
        bgcolor="white"
      >
        <TextField
          variant="outlined"
          label="Type your message"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton color="warning" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
      <Box
        p={2}
        display="flex"
        justifyContent="center"
        zIndex={1}
        bgcolor="white"
      >
        <Button variant="contained" color="warning" onClick={handleSummarize}>
          Summarize the discussion
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
