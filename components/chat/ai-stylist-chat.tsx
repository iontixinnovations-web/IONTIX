"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useAIChat } from "@/hooks"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

const SUGGESTIONS = [
  "What makeup suits my skin tone?",
  "Recommend a skincare routine",
  "Help me find a party outfit",
  "What's trending this season?",
]

export function AIStylistChat() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, send, isSending, clear } = useAIChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    await send({ message: input.trim() })
    setInput("")
  }

  const handleSuggestion = async (suggestion: string) => {
    await send({ message: suggestion })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Beauty Stylist</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Get personalized beauty advice, product recommendations, and style tips
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={isSending}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[80%]", msg.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Product Recommendations */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Recommended products:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {(msg.products as { product_id: string; name: string; image: string; price: number }[]).map(
                        (product) => (
                          <Link key={product.product_id} href={`/shop/product/${product.product_id}`}>
                            <Card className="w-32 p-2 hover:bg-muted">
                              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                                <Image src={product.image || "/placeholder.svg"} alt="" fill className="object-cover" />
                              </div>
                              <p className="text-xs font-medium truncate">{product.name}</p>
                              <p className="text-xs text-primary">INR {product.price}</p>
                            </Card>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 bg-transparent"
                        onClick={() => handleSuggestion(suggestion)}
                        disabled={isSending}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback>
                <Sparkles className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about beauty..."
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim() || isSending}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
