"use client";

import { useState, useRef, useEffect } from "react";
import { signInAnonymously, updateProfile, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Terminal as TerminalIcon } from "lucide-react";

type AuthMode = "anonymous" | "google" | "email";

export function SignIn({ onSignIn }: { onSignIn: (name: string) => void }) {
  const [authMode, setAuthMode] = useState<AuthMode>("anonymous");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [authMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is using modifiers (like Ctrl+C, etc)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const modes: AuthMode[] = ["anonymous", "google", "email"];
        const currentIndex = modes.indexOf(authMode);
        
        let nextIndex;
        if (e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % modes.length;
        } else {
          nextIndex = (currentIndex - 1 + modes.length) % modes.length;
        }
        
        setAuthMode(modes[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authMode]);

  const checkFirebase = () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "YOUR_API_KEY") {
      console.warn("Firebase not configured. Using mock local auth for demonstration.");
      return false;
    }
    return true;
  }

  const handleAnonymous = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setLoading(true);
    setError("");

    try {
      if (!checkFirebase()) {
        setTimeout(() => onSignIn(cleanName), 800);
        return;
      }
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, { displayName: cleanName });
      onSignIn(cleanName);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      if (!checkFirebase()) {
        setTimeout(() => onSignIn("google_operative"), 800);
        return;
      }
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      onSignIn(userCredential.user.displayName || "operative");
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");
    try {
      if (!checkFirebase()) {
        setTimeout(() => onSignIn(email.split("@")[0]), 800);
        return;
      }
      
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: email.split("@")[0] });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onSignIn(userCredential.user.displayName || email.split("@")[0]);
    } catch (err: any) {
      setError(err.message || "Email Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto z-10 p-4">
      <div className="relative w-full bg-[#0c0c0c]/90 backdrop-blur-xl rounded-lg flex flex-col shadow-[0_0_50px_rgba(0,255,65,0.15)] border border-matrix/30 overflow-hidden font-mono text-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] border-b border-matrix/30 select-none">
          <div className="flex items-center space-x-2 text-matrix/70">
            <TerminalIcon size={14} />
            <span className="text-xs font-bold tracking-widest uppercase">login_sequence</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-500">
            <span className="hover:text-green-400 cursor-pointer transition-colors leading-none pb-1 font-bold">_</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors leading-none pb-1 font-bold">◻</span>
            <span className="hover:text-red-500 cursor-pointer transition-colors leading-none pb-1 font-bold">×</span>
          </div>
        </div>

        <div className="p-8 flex flex-col text-matrix text-base md:text-lg">
          <div className="animate-pulse opacity-80 mb-6">
            Establishing secure connection...<br/>
            Select authentication protocol (Use ←/→ arrow keys to cycle).
          </div>

          <div className="flex space-x-4 mb-6 border-b border-matrix/30 pb-2">
             <button onClick={() => setAuthMode("anonymous")} className={`px-2 py-1 transition-colors ${authMode === "anonymous" ? "bg-matrix text-black font-bold" : "text-matrix hover:bg-matrix/10"}`}>[ ANONYMOUS ]</button>
             <button onClick={() => setAuthMode("google")} className={`px-2 py-1 transition-colors ${authMode === "google" ? "bg-matrix text-black font-bold" : "text-matrix hover:bg-matrix/10"}`}>[ GOOGLE ]</button>
             <button onClick={() => setAuthMode("email")} className={`px-2 py-1 transition-colors ${authMode === "email" ? "bg-matrix text-black font-bold" : "text-matrix hover:bg-matrix/10"}`}>[ EMAIL ]</button>
          </div>

          {authMode === "anonymous" && (
            <form onSubmit={handleAnonymous} className="flex flex-col space-y-4">
              <div className="text-gray-400 text-sm border-l-2 border-matrix/50 pl-4 py-2">Enter designated operative alias to join the Global Chat Relay.</div>
              <div className="flex items-center text-xl font-bold mt-4">
                <span className="mr-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Identify:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none outline-none text-white shadow-none focus:ring-0 p-0 m-0 caret-green-500 uppercase disabled:opacity-50"
                  placeholder="USERNAME_"
                  maxLength={16}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </form>
          )}

          {authMode === "google" && (
            <div className="flex flex-col space-y-4">
               <div className="text-gray-400 text-sm border-l-2 border-matrix/50 pl-4 py-2">Authenticate using your Google credentials via secure OAuth tunneling.</div>
               <button onClick={handleGoogle} disabled={loading} className="w-fit px-6 py-3 mt-4 border border-matrix hover:bg-matrix hover:text-black transition-colors font-bold uppercase disabled:opacity-50">
                 Initialize Google Auth
               </button>
            </div>
          )}

          {authMode === "email" && (
             <form className="flex flex-col space-y-4">
               <div className="text-gray-400 text-sm border-l-2 border-matrix/50 pl-4 py-2">Enter secure email link credentials.</div>
               <div className="flex items-center text-lg mt-4">
                 <span className="mr-3 text-green-400 w-16">Email:</span>
                 <input ref={inputRef} type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent border-b border-matrix/30 outline-none text-white p-1 focus:border-matrix" placeholder="operative@system.com" />
               </div>
               <div className="flex items-center text-lg">
                 <span className="mr-3 text-green-400 w-16">Passw:</span>
                 <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 bg-transparent border-b border-matrix/30 outline-none text-white p-1 focus:border-matrix" placeholder="********" />
               </div>
               <div className="flex space-x-4 pt-4">
                 <button onClick={(e) => handleEmail(e, false)} disabled={loading} className="px-6 py-2 bg-matrix text-black font-bold hover:bg-white transition-colors uppercase">Login</button>
                 <button onClick={(e) => handleEmail(e, true)} disabled={loading} className="px-6 py-2 border border-matrix hover:bg-matrix/10 transition-colors uppercase">Register</button>
               </div>
             </form>
          )}

          {loading && <div className="text-yellow-400 text-sm mt-6 animate-pulse">Authenticating credentials...</div>}
          {error && <div className="text-red-500 text-sm mt-6 break-words">ERROR: {error}</div>}
        </div>
      </div>
    </div>
  );
}
