"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageCircle, Send, User as UserIcon } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export default function MessagingUI() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages/contacts")
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d)) return;
        setContacts(d);
        if (d.length > 0 && !activeId) setActiveId(d[0].id);
      });
  }, [activeId]);

  const loadMessages = useCallback(async () => {
    if (!activeId) return;
    const r = await fetch(`/api/messages/with/${activeId}`);
    if (r.ok) {
      const data = await r.json();
      setMessages(data);
    }
  }, [activeId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeId) return;
    setSending(true);
    const r = await fetch(`/api/messages/with/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    setSending(false);
    if (r.ok) {
      setInput("");
      loadMessages();
    }
  };

  const active = contacts.find((c) => c.id === activeId);

  return (
    <div className="pt-8 lg:pt-0 animate-fade-in h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
        <MessageCircle className="text-pink-500" /> Mensajes
      </h1>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-0">
        <div className="border-r border-gray-100 overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="text-center text-gray-400 p-6 text-sm">Sin contactos</p>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  activeId === c.id ? "bg-orange-50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                  {c.firstName[0]}
                  {c.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-col min-h-0">
          {active ? (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {active.firstName[0]}
                  {active.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {active.firstName} {active.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{active.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    Sin mensajes — empieza la conversacion
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-orange-500 text-white rounded-br-sm"
                              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t border-gray-100 flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <UserIcon size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
