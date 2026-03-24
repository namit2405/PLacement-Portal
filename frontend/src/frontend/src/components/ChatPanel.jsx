import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConversations, useMessages, useSendMessage } from "../hooks/useQueries";

function Avatar({ name, size = "sm" }) {
  const initials = (name || "?")[0].toUpperCase();
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div className={`${sz} rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar name={isOwn ? "Me" : (msg.sender?.first_name || msg.sender?.username)} />
      <div className={`max-w-[70%] space-y-0.5 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {msg.job_title && (
          <span className="text-xs text-muted-foreground px-1">re: {msg.job_title}</span>
        )}
        <div className={`px-3 py-2 rounded-2xl text-sm ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
          {msg.body}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function MessageThread({ partnerId, partnerName, jobId, onBack }) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(partnerId);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage.mutate({ partnerId, body: text.trim(), jobId }, {
      onSuccess: () => setText(""),
      onError: () => setText(text),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        {onBack && (
          <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm mr-1">←</button>
        )}
        <Avatar name={partnerName} />
        <div>
          <p className="text-sm font-semibold">{partnerName}</p>
          {jobId && <p className="text-xs text-muted-foreground">Job conversation</p>}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-36 ml-auto" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No messages yet. Say hello!</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender?.id === user?.id} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-border shrink-0">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoFocus
        />
        <Button type="submit" size="sm" disabled={!text.trim() || sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ConversationList({ onSelect }) {
  const { data: conversations = [], isLoading } = useConversations();

  if (isLoading) return (
    <div className="space-y-3 p-4">
      {[1,2,3].map(i => <div key={i} className="flex gap-3 items-center"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>)}
    </div>
  );

  if (conversations.length === 0) return (
    <div className="text-center py-16 px-4">
      <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Messages from recruiters will appear here</p>
    </div>
  );

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const p = conv.partner;
        const name = p.first_name ? `${p.first_name} ${p.last_name}`.trim() : p.username;
        return (
          <button key={p.id} type="button" onClick={() => onSelect(p.id, name)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent text-left transition-colors">
            <div className="relative">
              <Avatar name={name} />
              {conv.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${conv.unread_count > 0 ? "font-semibold" : "font-medium"}`}>{name}</p>
                {conv.last_message && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(conv.last_message.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {conv.last_message && (
                <p className="text-xs text-muted-foreground truncate">{conv.last_message.body}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Full-page chat for student/recruiter tabs
export function ChatPage() {
  const [selected, setSelected] = useState(null); // { id, name }

  return (
    <div className="flex h-[calc(100vh-8rem)] border border-border rounded-xl overflow-hidden shadow-card bg-card">
      <div className={`w-full md:w-72 border-r border-border flex flex-col shrink-0 ${selected ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-3 border-b border-border">
          <p className="font-semibold text-sm">Messages</p>
        </div>
        <ConversationList onSelect={(id, name) => setSelected({ id, name })} />
      </div>

      <div className={`flex-1 flex flex-col ${selected ? "flex" : "hidden md:flex"}`}>
        {selected ? (
          <MessageThread
            partnerId={selected.id}
            partnerName={selected.name}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline chat panel — used inside recruiter's applicant view
export function InlineChatPanel({ partnerId, partnerName, jobId }) {
  return (
    <div className="h-96 border border-border rounded-xl overflow-hidden shadow-card bg-card flex flex-col">
      <MessageThread partnerId={partnerId} partnerName={partnerName} jobId={jobId} />
    </div>
  );
}
