import { useState, useEffect, useRef } from "react";

export default function ChatPage({ currentUser, tenants }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat for selected tenant
  useEffect(() => {
    if (selectedTenant) {
      const savedMessages = JSON.parse(
        localStorage.getItem(`chat_${selectedTenant.email}`) || "[]"
      );
      setMessages(savedMessages);
    }
  }, [selectedTenant]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTenant) return;

    const updatedMessages = [
      ...messages,
      { sender: currentUser.name, text: newMessage, time: new Date().toISOString() },
    ];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${selectedTenant.email}`, JSON.stringify(updatedMessages));
    setNewMessage("");
  };

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Tenant List */}
      <div className="w-1/4 border-r border-gray-300 bg-white p-4 overflow-y-auto">
        <h2 className="font-bold mb-4 text-gray-700">Tenants</h2>
        {tenants?.length ? (
          tenants.map((tenant) => (
            <div
              key={tenant.email}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedTenant?.email === tenant.email
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedTenant(tenant)}
            >
              <p className="font-medium">{tenant.name}</p>
              <p className="text-sm text-gray-500">{tenant.email}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No tenants available</p>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedTenant ? (
          <>
            <div className="p-4 border-b border-gray-300 font-semibold text-gray-700">
              Chat with {selectedTenant.name}
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded max-w-xs ${
                    msg.sender === currentUser.name
                      ? "bg-blue-200 self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  <p className="text-sm font-medium">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.time).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-300 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
            Select a tenant to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
