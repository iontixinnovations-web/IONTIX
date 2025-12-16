"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import type { Chat } from "@/lib/api"

interface ChatListProps {
  chats: Chat[]
  onSelect: (chatId: string) => void
}

export function ChatList({ chats, onSelect }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-1">Start a chat with a seller from a product page</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat.id)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.participant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{chat.participant.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            {chat.participant.is_online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{chat.participant.name}</p>
              {chat.last_message && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
            {chat.last_message && <p className="text-sm text-muted-foreground truncate">{chat.last_message.content}</p>}
          </div>

          {chat.unread_count > 0 && (
            <Badge variant="default" className="rounded-full">
              {chat.unread_count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
}
