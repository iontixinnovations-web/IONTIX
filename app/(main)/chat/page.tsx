/**
 * Chat Page
 * Messaging with vendors and AI stylist
 */

"use client"

import { useState } from "react"
import { useChats } from "@/hooks"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { AIStylistChat } from "@/components/chat/ai-stylist-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, MessageCircle, Loader2 } from "lucide-react"

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"messages" | "ai">("messages")
  const { chats, isLoading } = useChats()

  return (
    <main className="min-h-screen pb-20">
      <div className="container px-4 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "messages" | "ai")}>
          <TabsList className="w-full">
            <TabsTrigger value="messages" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Stylist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : selectedChatId ? (
              <ChatWindow chatId={selectedChatId} onBack={() => setSelectedChatId(null)} />
            ) : (
              <ChatList chats={chats} onSelect={setSelectedChatId} />
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <AIStylistChat />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
