"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Sparkles } from "lucide-react";

interface CommandRecord {
  cmd: string;
  output: React.ReactNode;
}

export function TerminalUI() {
  const [history, setHistory] = useState<CommandRecord[]>([
    {
      cmd: "status",
      output: <span className="text-green-400 font-bold">SYSTEM_READY. ALL ENGINES GO.</span>,
    },
    {
      cmd: "objective",
      output: <span className="text-yellow-400 font-bold">BUILD_STUNNING_WEBSITE</span>,
    },
    {
      cmd: "task",
      output: (
        <div className="flex flex-col space-y-2 mt-1">
          <span className="text-purple-400 font-bold border-b border-purple-400/30 pb-1">HOW TO WIN WEBMANIAC:</span>
          <span className="text-gray-300"><span className="text-blue-400 mr-2">1.</span>Build a stunning, highly creative design.</span>
          <span className="text-gray-300"><span className="text-blue-400 mr-2">2.</span>Ensure flawless functionality and responsiveness.</span>
          <span className="text-gray-300"><span className="text-blue-400 mr-2">3.</span>Write clean, high-quality original code.</span>
          <span className="text-gray-300"><span className="text-blue-400 mr-2">4.</span>Deploy successfully on Vercel, Netlify, or Render.</span>
          <span className="text-yellow-300 mt-2 italic flex items-center"><Sparkles size={14} className="mr-2"/> Be unique. Don't rely on generic templates!</span>
        </div>
      ),
    }
  ]);
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of the terminal container only
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let output: React.ReactNode = "";

    switch (cmd) {
      case "help":
        output = (
          <div className="flex flex-col space-y-1">
            <span className="text-purple-400 font-bold mb-1">Available commands:</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">help</span> - Show this message</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">status</span> - Check system status</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">objective</span> - View mission objective</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">task</span> - Learn how to win the challenge</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">deployment</span> - View deployment options</span>
            <span className="text-gray-300"><span className="text-blue-400 w-24 inline-block">clear</span> - Clear terminal</span>
          </div>
        );
        break;
      case "status":
        output = <span className="text-green-400 font-bold">SYSTEM_READY. ALL ENGINES GO.</span>;
        break;
      case "objective":
        output = <span className="text-yellow-400 font-bold">WIN THE WEBMANIAC CHALLENGE.</span>;
        break;
      case "task":
        output = (
          <div className="flex flex-col space-y-2 mt-1">
            <span className="text-purple-400 font-bold border-b border-purple-400/30 pb-1">HOW TO WIN WEBMANIAC:</span>
            <span className="text-gray-300"><span className="text-blue-400 mr-2">1.</span>Build a stunning, highly creative design.</span>
            <span className="text-gray-300"><span className="text-blue-400 mr-2">2.</span>Ensure flawless functionality and responsiveness.</span>
            <span className="text-gray-300"><span className="text-blue-400 mr-2">3.</span>Write clean, high-quality original code.</span>
            <span className="text-gray-300"><span className="text-blue-400 mr-2">4.</span>Deploy successfully on Vercel, Netlify, or Render.</span>
            <span className="text-yellow-300 mt-2 italic flex items-center"><Sparkles size={14} className="mr-2"/> Be unique. Don't rely on generic templates!</span>
          </div>
        );
        break;
      case "deployment":
        output = <span className="text-blue-300">TARGET PLATFORMS: <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">VERCEL</span> | <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">NETLIFY</span> | <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">RENDER</span></span>;
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      default:
        output = <span className="text-red-400">command not found: {cmd}</span>;
    }

    setHistory((prev) => [...prev, { cmd, output }]);
    setInput("");
  };

  return (
    <div 
      className="relative w-full h-[400px] bg-[#0c0c0c]/90 backdrop-blur-xl rounded-lg flex flex-col shadow-[0_0_50px_rgba(0,255,65,0.1)] border border-matrix/20 overflow-hidden font-mono text-sm group transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,255,65,0.2)]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Colorful Linux Style Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] border-b border-matrix/20 select-none">
        <div className="flex items-center space-x-2 text-matrix/70">
          <TerminalIcon size={14} />
          <span className="text-xs font-bold tracking-widest uppercase">bash</span>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-xs font-bold tracking-wider animate-pulse">
          hacker@webmaniac:~
        </div>

        <div className="flex items-center space-x-3 text-gray-500">
          <span className="hover:text-green-400 cursor-pointer transition-colors leading-none pb-1 font-bold">_</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors leading-none pb-1 font-bold">◻</span>
          <span className="hover:text-red-500 cursor-pointer transition-colors leading-none pb-1 font-bold">×</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 text-gray-300 scroll-smooth"
      >
        <div className="text-matrix mb-2 opacity-80">
          Welcome to WebManiac OS v1.0.0. Type <span className="text-white font-bold bg-white/10 px-1 rounded">help</span> for available commands.
        </div>
        
        {history.map((record, i) => (
          <div key={i} className="flex flex-col space-y-1">
            <div className="flex items-center">
              <span className="mr-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold">hacker@webmaniac:~$</span>
              <span className="text-white font-bold">{record.cmd}</span>
            </div>
            <div className="ml-4 break-words whitespace-pre-wrap">{record.output}</div>
          </div>
        ))}

        {/* Active Input Line */}
        <form onSubmit={handleCommand} className="flex items-center mt-2">
          <span className="mr-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold whitespace-nowrap">hacker@webmaniac:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-bold shadow-none focus:ring-0 p-0 m-0 caret-green-500"
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
