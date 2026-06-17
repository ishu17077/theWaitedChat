"use client";

import { useState, useEffect, useRef } from "react";
import { Preloader } from "@/components/ui/Preloader";
import { ChatTerminal } from "@/components/ui/ChatTerminal";
import { SignIn } from "@/components/ui/SignIn";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  
  // Local fallback typing state
  const [localTypingState, setLocalTypingState] = useState<{ [id: string]: boolean }>({});
  
  // Global Firebase typists: { [username]: timestamp }
  const [globalTypists, setGlobalTypists] = useState<{ [user: string]: number }>({});
  
  // Derived boolean indicating if ANYONE in the world (or locally) is typing
  const [isTypingAnywhere, setIsTypingAnywhere] = useState(false);

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

  // Listen to global typing state from Firestore
  useEffect(() => {
    if (!useFirebase) return;
    
    const unsubscribe = onSnapshot(doc(db, "system", "typing_state"), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalTypists(docSnap.data().typists || {});
      }
    });
    
    return () => unsubscribe();
  }, [useFirebase]);

  // Heartbeat checker: determine if someone is ACTUALLY typing right now (within 5 seconds)
  useEffect(() => {
    const checkTyping = () => {
      let typing = false;
      
      if (useFirebase) {
        const now = Date.now();
        // Check if ANY user has a timestamp within the last 5 seconds
        typing = Object.values(globalTypists).some((timestamp) => now - timestamp < 5000);
      } else {
        typing = Object.values(localTypingState).some(isTyping => isTyping);
      }
      
      setIsTypingAnywhere(typing);
    };

    // Run immediately and then every 1 second
    checkTyping();
    const interval = setInterval(checkTyping, 1000);
    
    return () => clearInterval(interval);
  }, [globalTypists, localTypingState, useFirebase]);

  // Throttled Firestore update logic
  const lastWriteTimeRef = useRef(0);

  const handleTypingChange = async (id: string, isTyping: boolean) => {
    if (!useFirebase) {
      setLocalTypingState(prev => ({ ...prev, [id]: isTyping }));
      return;
    }
    
    if (!username) return;

    const now = Date.now();
    
    if (isTyping) {
      // Throttle writes to once every 2.5 seconds to save quota
      if (now - lastWriteTimeRef.current > 2500) {
        lastWriteTimeRef.current = now;
        try {
          await setDoc(doc(db, "system", "typing_state"), {
            typists: { [username]: now }
          }, { merge: true });
        } catch (e) {
          console.error("Failed to update global typing state", e);
        }
      }
    } else {
      // They completely stopped typing or sent a message. Remove them immediately.
      lastWriteTimeRef.current = 0; // Reset throttle
      try {
        await setDoc(doc(db, "system", "typing_state"), {
          typists: { [username]: 0 } // Expired timestamp
        }, { merge: true });
      } catch (e) {
        console.error("Failed to clear global typing state", e);
      }
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
            onTypingChange={(isTyping) => handleTypingChange("group-chat", isTyping)} 
            channelName="group_chat_room"
            firebaseCollection="global_messages"
            showBotControls={true}
          />
          <ChatTerminal 
            id="private-chat" 
            title="PRIVATE CONVERSATION" 
            currentUser={username}
            isTypingAnywhere={isTypingAnywhere} 
            onTypingChange={(isTyping) => handleTypingChange("private-chat", isTyping)} 
            channelName="private_chat_room"
          />
        </div>
      )}
      
      {/* Footer / Status Bar */}
      <footer className="mt-10 py-6 border-t border-white/10 glass-panel z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-gray-500">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className={`w-2 h-2 rounded-full ${isTypingAnywhere ? "bg-yellow-400" : "bg-matrix"} animate-pulse`} />
            <span>{isTypingAnywhere ? "GLOBAL_LOCK_ACTIVE" : "SYSTEM_ONLINE"}</span>
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
