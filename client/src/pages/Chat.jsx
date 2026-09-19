import { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Send, MessageCircle, Loader2 } from "lucide-react";

import { io } from "socket.io-client";

import api from "../api/axios";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [match, setMatch] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // =========================================================
  // LOAD CHAT
  // =========================================================

  useEffect(() => {
    if (!matchId) {
      console.error("CHAT ERROR: matchId is missing");

      setError("Invalid match.");
      setLoading(false);

      return;
    }

    const loadChat = async () => {
      try {
        setLoading(true);
        setError("");


        const response = await api.get(`/chat/${matchId}/messages`);


        setMessages(response.data.messages || []);

        if (response.data.match) {
          setMatch(response.data.match);
        }
      } catch (err) {
        console.error("LOAD CHAT ERROR:", err);

        setError(
          err.response?.data?.message || "Unable to load this conversation.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [matchId]);

  // =========================================================
  // SOCKET.IO
  // =========================================================

  useEffect(() => {
    if (!matchId) {
      return;
    }


    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    // -------------------------------------------------------
    // Connected
    // -------------------------------------------------------

    socket.on("connect", () => {
     
      socket.emit("join_match", matchId);
    });

    // -------------------------------------------------------
    // Receive new message
    // -------------------------------------------------------

    socket.on("new_message", (newMessage) => {

      if (!newMessage) {
        return;
      }

      setMessages((previousMessages) => {
        // Prevent duplicate messages
        const alreadyExists = previousMessages.some(
          (existingMessage) =>
            String(existingMessage._id) === String(newMessage._id),
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });
    });

    // -------------------------------------------------------
    // Socket error
    // -------------------------------------------------------

    socket.on("connect_error", (err) => {
      console.error("SOCKET CONNECTION ERROR:", err);
    });

    // -------------------------------------------------------
    // Disconnect
    // -------------------------------------------------------

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------

    return () => {

      socket.emit("leave_match", matchId);

      socket.disconnect();

      socketRef.current = null;
    };
  }, [matchId]);

  // =========================================================
  // SCROLL TO BOTTOM
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");


      const response = await api.post(`/chat/${matchId}/messages`, {
        text,
      });


      const newMessage = response.data.message;

    

      if (newMessage) {
        setMessages((previousMessages) => {
          const alreadyExists = previousMessages.some(
            (existingMessage) =>
              String(existingMessage._id) === String(newMessage._id),
          );

          if (alreadyExists) {
            return previousMessages;
          }

          return [...previousMessages, newMessage];
        });
      }

      setMessage("");
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);

      setError(err.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!sending && message.trim()) {
        handleSendMessage(e);
      }
    }
  };

  // =========================================================
  // OTHER USER
  // =========================================================

  const getOtherUser = () => {
    if (!match) {
      return null;
    }

    if (match.user1 && match.user2) {
      const user1Id =
        typeof match.user1 === "object"
          ? match.user1._id || match.user1.id
          : match.user1;

      const currentId = currentUser?.id || currentUser?._id;

      if (String(user1Id) === String(currentId)) {
        return match.user2;
      }

      return match.user1;
    }

    return match.otherUser || match.user || match.matchedUser || null;
  };

  const otherUser = getOtherUser();

  const getUserName = () => {
    if (!otherUser) {
      return "Your Match";
    }

    return otherUser.name || otherUser.username || "Your Match";
  };

  // =========================================================
  // MESSAGE HELPERS
  // =========================================================

  const getSenderId = (msg) => {
    if (!msg?.sender) {
      return null;
    }

    if (typeof msg.sender === "object") {
      return msg.sender._id || msg.sender.id;
    }

    return msg.sender;
  };

  const isMyMessage = (msg) => {
    const senderId = getSenderId(msg);

    const currentId = currentUser?.id || currentUser?._id;

    return String(senderId) === String(currentId);
  };

  const getMessageText = (msg) => {
    return msg?.text || msg?.message || "";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page-center">
        <Loader2 className="spinner" size={30} />

        <p>Loading conversation...</p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !messages.length) {
    return (
      <div className="page-center">
        <MessageCircle size={45} />

        <h2>Unable to open chat</h2>

        <p>{error}</p>

        <Link to="/matches" className="primary-button">
          Back to Matches
        </Link>
      </div>
    );
  }

  // =========================================================
  // CHAT UI
  // =========================================================

  return (
    <div className="chat-page">
      {/* HEADER */}

      <div className="chat-header">
        <button
          type="button"
          className="chat-back-button"
          onClick={() => navigate("/matches")}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="chat-header-avatar">
          {otherUser?.profilePhoto ? (
            <img src={otherUser.profilePhoto} alt={getUserName()} />
          ) : (
            <MessageCircle size={22} />
          )}
        </div>

        <div className="chat-header-info">
          <h3>{getUserName()}</h3>

          <span>Your match ❤️</span>
        </div>
      </div>

      {/* ERROR */}

      {error && <div className="error-message">{error}</div>}

      {/* MESSAGES */}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <MessageCircle size={45} />

            <h3>Start the conversation</h3>

            <p>Say hello and start getting to know your match.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id || msg.id}
              className={`message ${isMyMessage(msg) ? "mine" : ""}`}
            >
              <div className="message-bubble">{getMessageText(msg)}</div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />

        <button type="submit" disabled={!message.trim() || sending}>
          {sending ? (
            <Loader2 className="spinner" size={18} />
          ) : (
            <>
              <Send size={18} />
              Send
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;
