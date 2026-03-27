import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(import.meta.env.VITE_CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        const errorText = err instanceof Error ? err.message : "Something went wrong";
        updated[updated.length - 1] = {
          ...last,
          content: last.content || `Error: ${errorText}`,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center p-0 sm:p-4">
      <Card className="flex h-full w-full max-w-2xl flex-col rounded-none sm:h-175 sm:rounded-2xl">
        <CardHeader className="border-b py-3 sm:py-6">
          <CardTitle className="text-lg">Ollama Chat</CardTitle>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4 sm:p-6">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Send a message to start chatting.
                </p>
              )}
              {messages.map((msg, i) => {
                if (msg.role === "assistant" && msg.content === "" && loading) {
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground animate-pulse">
                        Thinking...
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        {msg.role === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm text-left whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t px-4 pt-3 pb-[env(safe-area-inset-bottom,0.75rem)] sm:px-6 sm:pt-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              autoFocus
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
