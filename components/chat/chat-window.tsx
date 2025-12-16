"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatMessages } from "@/hooks"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatWindowProps {
  chatId: string
  onBack: () => void
}

export function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, send, isSending, markRead } = useChatMessages(chatId)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark as read
  useEffect(() => {
    markRead()
  }, [chatId, markRead])

  const handleSend = async () => {
    if (!message.trim()) return
    await send({ content: message.trim() })
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id !== msg.chat_id // Simplified check
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{msg.sender.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[70%]", isOwn && "items-end")}>
                  <div
                    className={cn("rounded-2xl px-4 py-2", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(msg.created_at), "HH:mm")}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button variant="ghost" size="icon">
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!message.trim() || isSending}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
