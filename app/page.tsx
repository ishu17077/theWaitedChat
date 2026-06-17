"use client";

import { useState, useEffect, useRef } from "react";
import { Preloader } from "@/components/ui/Preloader";
import { ChatTerminal } from "@/components/ui/ChatTerminal";
import { DirectMessagesPanel } from "@/components/ui/DirectMessagesPanel";
import { SignIn } from "@/components/ui/SignIn";
import { ref, onValue, set, onDisconnect, remove } from "firebase/database";
import { rtdb, db } from "@/lib/firebase";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  // Local fallback typing state
  const [localTypingState, setLocalTypingState] = useState<{ [id: string]: boolean }>({});

  // Global Firebase typists array
  const [activeTypists, setActiveTypists] = useState<string[]>([]);

  // Derived boolean indicating if ANYONE in the world (or locally) is typing
  const isTypingAnywhere = activeTypists.length > 0 || Object.values(localTypingState).some(t => t);

  const useFirebase = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_API_KEY";

  // Persist authentication state across page reloads
  useEffect(() => {
    if (!useFirebase) {
      const saved = localStorage.getItem("chat_username");
      if (saved) setUsername(saved);
      return;
    }

    import("@/lib/firebase").then(({ auth }) => {
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUsername(user.displayName || user.email?.split("@")[0] || "operative");
          }
        });
        return () => unsubscribe();
      });
    });
  }, [useFirebase]);

  const handleSignIn = (name: string) => {
    setUsername(name);
    if (!useFirebase) {
      localStorage.setItem("chat_username", name);
    }
  };

  // Register user into global directory instantly upon login
  useEffect(() => {
    if (useFirebase && username) {
      import("firebase/firestore").then(({ setDoc, doc }) => {
        setDoc(doc(db, "users", username), {
          lastActive: Date.now()
        }, { merge: true }).catch(err => console.error("Failed to register user", err));
      });
    }
  }, [username, useFirebase]);

  // Listen to global typing state from RTDB
  useEffect(() => {
    if (!useFirebase) return;

    const typingRef = ref(rtdb, "typing_state");
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Extract users who are actively typing (value is true)
        const typists = Object.entries(val)
          .filter(([_, isTyping]) => isTyping)
          .map(([name, _]) => name);
        setActiveTypists(typists);
      } else {
        setActiveTypists([]);
      }
    });

    return () => unsubscribe();
  }, [useFirebase]);

  const handleTypingChange = async (id: string, isTyping: boolean) => {
    // Always track local typing state so the queue lock works exclusively for you
    setLocalTypingState(prev => ({ ...prev, [id]: isTyping }));
    
    if (!useFirebase || !username) return;

    const userTypingRef = ref(rtdb, `typing_state/${username}`);

    try {
      if (isTyping) {
        // Setup auto-cleanup if the user disconnects abruptly
        await onDisconnect(userTypingRef).remove();
        await set(userTypingRef, true);
      } else {
        await remove(userTypingRef);
        onDisconnect(userTypingRef).cancel();
      }
    } catch (e) {
      console.error("Failed to sync typing state:", e);
    }
  };

  return (
    <main className="flex flex-col w-full min-h-screen relative p-4">
      <Preloader />

      <div className="text-center mt-20 mb-8 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-glow text-matrix mb-4">The Chat That Waits</h1>
        <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto px-4">
          Rule: If ANYONE in the world is typing, all incoming messages (including your own) are held back until everybody completely stops typing.
        </p>
      </div>

      {!username ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full z-10 flex-1">
          <ChatTerminal
            id="group-chat"
            title="GLOBAL GROUP CHAT"
            currentUser={username}
            isTypingAnywhere={isTypingAnywhere}
            activeTypists={useFirebase ? activeTypists : Object.entries(localTypingState).filter(([_, t]) => t).map(() => username)}
            onTypingChange={(isTyping) => handleTypingChange("group-chat", isTyping)}
            channelName="group_chat_room"
            firebaseCollection="global_messages"
            showBotControls={true}
          />
          <DirectMessagesPanel 
            currentUser={username}
            isTypingAnywhere={isTypingAnywhere} 
            activeTypists={useFirebase ? activeTypists : Object.entries(localTypingState).filter(([_, t]) => t).map(() => username)}
            onTypingChange={(isTyping) => handleTypingChange("direct-messages", isTyping)} 
            useFirebase={useFirebase}
          />
        </div>
      )}

      {/* Footer / Status Bar */}
      <footer className="mt-10 py-6 border-t border-white/10 glass-panel z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-gray-500">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className={`w-2 h-2 rounded-full ${isTypingAnywhere ? "bg-yellow-400 animate-pulse" : "bg-matrix"}`} />
            <span>{isTypingAnywhere ? `HOLDING MESSAGES: ${activeTypists.join(", ")} TYPING...` : "SYSTEM_ONLINE"}</span>
            {username && <span className="ml-4 text-matrix opacity-70">OP: {username}</span>}
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-matrix cursor-pointer transition-colors">AOT_FIESTA_2026</span>
            <span className="hover:text-matrix cursor-pointer transition-colors">WebManiac</span>
            <span className="hover:text-matrix cursor-pointer transition-colors">END_OF_FILE</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
