import React, { useState, useEffect, useRef } from "react";
import { Send, X, Shield, Lock, LockKeyhole } from "lucide-react";
import CryptoJS from "crypto-js";
import echo from "../services/echo";

export default function MaskedChatDrawer({
  conversationId,
  isOpen,
  onClose,
  currentUser,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Normalized Encryption Key
  const SECRET_KEY = `BloodLink_Secure_Chat_${String(conversationId)}`;

  // Encrypt Plain Text
  const encryptText = (plainText) => {
    try {
      return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
    } catch (e) {
      return plainText;
    }
  };

  // Safe Decrypt Function with guaranteed non-empty return
  const getDisplayText = (content) => {
    if (content === null || content === undefined) return "";
    const rawText = typeof content === "object" ? content.message || "" : String(content);

    if (!rawText.trim()) return "";

    try {
      const bytes = CryptoJS.AES.decrypt(rawText, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (originalText && originalText.trim().length > 0) {
        return originalText;
      }
      return rawText; // Fallback to raw string if decryption yields empty
    } catch (e) {
      return rawText; // Fallback to raw text if plain string
    }
  };

  // Helper to format timestamps (e.g. 10:15 PM)
  const formatTime = (timeStr) => {
    if (!timeStr) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    try {
      const date = new Date(timeStr);
      return isNaN(date.getTime())
        ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (!conversationId || !isOpen) return;

    const token = localStorage.getItem("bloodlink_token");

    // 1. Fetch Chat History and Sort Chronologically
    fetch(`http://127.0.0.1:8000/api/chat/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const rawMsgs = res.data.messages || [];
          const sortedMsgs = rawMsgs.sort(
            (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
          );
          setMessages(sortedMsgs);

          const requester = res.data.requester;
          const donor = res.data.donor;

          if (String(currentUser?.id) === String(requester?.id)) {
            setOtherUser(donor);
          } else {
            setOtherUser(requester);
          }
        }
      })
      .catch((err) => console.error("Error fetching chat:", err));

    // 2. Connect Reverb Private Channel
    const channel = echo.private(`chat.${conversationId}`);

    const handleIncomingMessage = (data) => {
      console.log("⚡ Realtime Message Received:", data);
      setIsTyping(false);

      const incomingMsg = data.message || data;
      if (!incomingMsg || !incomingMsg.id) return;

      setMessages((prev) => {
        const msgId = incomingMsg.id;
        const exists = prev.some((m) => String(m.id) === String(msgId));
        if (exists) return prev;

        const updatedList = [...prev, incomingMsg];
        return updatedList.sort(
          (a, b) => new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
        );
      });
    };

    // Support both dot-prefixed and raw event names
    channel.listen(".message.sent", handleIncomingMessage);
    channel.listen("MessageSent", handleIncomingMessage);

    // Typing Indicator Whisper Listener
    channel.listenForWhisper("typing", (e) => {
      if (String(e.userId) !== String(currentUser?.id)) {
        setIsTyping(true);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    return () => {
      channel.stopListening(".message.sent");
      channel.stopListening("MessageSent");
      channel.stopListeningForWhisper("typing");
    };
  }, [conversationId, isOpen, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!conversationId) return;

    // Broadcast Whisper typing signal
    echo.private(`chat.${conversationId}`).whisper("typing", {
      userId: currentUser?.id,
      name: currentUser?.name,
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Strict empty check
    if (!newMessage || !newMessage.trim()) return;

    const rawMessage = newMessage.trim();
    setNewMessage("");

    const encryptedMessage = encryptText(rawMessage);
    const token = localStorage.getItem("bloodlink_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/${conversationId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ message: encryptedMessage }),
        }
      );

      const res = await response.json();
      if (res.data) {
        setMessages((prev) => {
          const exists = prev.some((msg) => String(msg.id) === String(res.data.id));
          if (exists) return prev;
          const updated = [...prev, res.data];
          return updated.sort(
            (a, b) => new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
          );
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-800">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-slate-400">Chatting with:</span>{" "}
                <span className="text-rose-400">
                  {otherUser?.name || "Participant"}
                </span>
              </h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                <Shield className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted & Phone Masked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages
            .filter((msg) => {
              const rawContent = msg.message ?? msg.text ?? "";
              const text = getDisplayText(rawContent);
              return text && text.trim().length > 0;
            })
            .map((msg) => {
              const isMe = String(msg.sender_id) === String(currentUser?.id);
              const senderName = isMe
                ? "You"
                : msg.sender?.name || otherUser?.name || "User";

              const rawContent = msg.message ?? msg.text ?? "";
              const textToRender = getDisplayText(rawContent);

              return (
                <div
                  key={msg.id || Math.random()}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {/* Sender Tag and Time */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {senderName}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium break-words ${
                      isMe
                        ? "bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-600/20"
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                    }`}
                  >
                    {textToRender}
                  </div>
                </div>
              );
            })}

          {/* Typing Indicator Display */}
          {isTyping && (
            <div className="flex flex-col items-start animate-fade-in">
              <span className="text-[10px] font-bold text-rose-400 mb-1 px-1">
                {otherUser?.name || "Participant"}
              </span>
              <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-medium text-slate-400 ml-1">
                  typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-slate-800/50 border-t border-slate-800 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Message ${otherUser?.name || "participant"}...`}
              value={newMessage}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-rose-500 placeholder:text-slate-500"
            />
            <LockKeyhole className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
          </div>
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-xl transition cursor-pointer shadow-md shadow-rose-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}