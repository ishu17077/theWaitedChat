import { useState, useEffect } from "react";
import { ChatTerminal } from "./ChatTerminal";
import { collection, doc, onSnapshot, setDoc, arrayUnion, arrayRemove, getDocs, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Globe, UserPlus, Check, X, Clock, MessageSquare } from "lucide-react";

interface DMProps {
  currentUser: string;
  isTypingAnywhere: boolean;
  activeTypists: Record<string, string>;
  onTypingChange: (isTyping: boolean, channelName?: string) => void;
  useFirebase: boolean | string;
}

export function DirectMessagesPanel({ currentUser, isTypingAnywhere, activeTypists, onTypingChange, useFirebase }: DMProps) {
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [selectedFriend, setSelectedFriend] = useState<string | null>("DIRECTORY");
  
  // Directory state
  const [allUsers, setAllUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!useFirebase) {
      const localFriends = JSON.parse(localStorage.getItem("chat_friends") || "[]");
      setFriends(localFriends);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", currentUser), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriends(data.friends || []);
        setFriendRequests(data.friendRequests || []);
        setSentRequests(data.sentRequests || []);
        setUnreadCounts(data.unreadCounts || {});
      }
    });

    return () => unsubscribe();
  }, [useFirebase, currentUser]);

  // Clear unread count when switching to a tab
  useEffect(() => {
    if (!useFirebase || selectedFriend === "DIRECTORY" || !selectedFriend) return;
    
    // If we have unread messages for this friend, clear them
    if (unreadCounts[selectedFriend] > 0) {
      setDoc(doc(db, "users", currentUser), {
        [`unreadCounts.${selectedFriend}`]: 0
      }, { merge: true }).catch(e => console.error(e));
    }
  }, [selectedFriend, unreadCounts, useFirebase, currentUser]);

  // Fetch the global directory
  useEffect(() => {
    if (!useFirebase || selectedFriend !== "DIRECTORY") return;
    
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users: string[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser) {
            users.push(doc.id);
          }
        });
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to fetch directory", err);
      }
    };
    
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [useFirebase, selectedFriend, currentUser]);

  const sendRequest = async (targetUser: string) => {
    if (!useFirebase) return;
    try {
      await setDoc(doc(db, "users", currentUser), {
        sentRequests: arrayUnion(targetUser)
      }, { merge: true });
      
      await setDoc(doc(db, "users", targetUser), {
        friendRequests: arrayUnion(currentUser)
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const acceptRequest = async (targetUser: string) => {
    if (!useFirebase) return;
    try {
      await setDoc(doc(db, "users", currentUser), {
        friends: arrayUnion(targetUser),
        friendRequests: arrayRemove(targetUser)
      }, { merge: true });

      await setDoc(doc(db, "users", targetUser), {
        friends: arrayUnion(currentUser),
        sentRequests: arrayRemove(currentUser)
      }, { merge: true });
      
      setSelectedFriend(targetUser);
    } catch (e) {
      console.error(e);
    }
  };

  const declineRequest = async (targetUser: string) => {
    if (!useFirebase) return;
    try {
      await setDoc(doc(db, "users", currentUser), {
        friendRequests: arrayRemove(targetUser)
      }, { merge: true });
      
      await setDoc(doc(db, "users", targetUser), {
        sentRequests: arrayRemove(currentUser)
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const getRoomId = (friend: string) => {
    return [currentUser, friend].sort().join("_");
  };

  const handleMessageSent = async () => {
    if (!useFirebase || !selectedFriend || selectedFriend === "DIRECTORY") return;
    
    // Increment the unread count on the recipient's document
    try {
      await setDoc(doc(db, "users", selectedFriend), {
        [`unreadCounts.${currentUser}`]: increment(1)
      }, { merge: true });
    } catch (e) {
      console.error("Failed to increment unread counter", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[500px]">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto bg-[#0c0c0c]/90 backdrop-blur-xl border border-matrix/20 rounded-t-lg shadow-[0_0_50px_rgba(0,255,65,0.1)] no-scrollbar z-20 relative">
        <button
          onClick={() => setSelectedFriend("DIRECTORY")}
          className={`px-4 py-3 font-mono text-xs border-r border-matrix/20 whitespace-nowrap transition-colors flex items-center ${selectedFriend === "DIRECTORY" ? "bg-matrix/20 text-matrix border-b-2 border-b-matrix" : "text-gray-500 hover:text-matrix/70"}`}
        >
          <Globe size={14} className="mr-2" /> DIRECTORY
          {friendRequests.length > 0 && (
            <span className="ml-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
              {friendRequests.length}
            </span>
          )}
        </button>

        {friends.map(friend => {
          const roomName = `dm_${getRoomId(friend)}`;
          const isFriendTypingToMe = activeTypists[friend] === roomName;
          const unreads = unreadCounts[friend] || 0;
          
          return (
            <button
              key={friend}
              onClick={() => setSelectedFriend(friend)}
              className={`px-4 py-3 font-mono text-xs border-r border-matrix/20 whitespace-nowrap transition-colors flex items-center ${selectedFriend === friend ? "bg-matrix/20 text-matrix border-b-2 border-b-matrix" : "text-gray-500 hover:text-matrix/70"}`}
            >
              {friend}
              
              {isFriendTypingToMe && (
                <span className="ml-2 text-yellow-500 animate-pulse tracking-widest font-bold">...</span>
              )}
              
              {!isFriendTypingToMe && unreads > 0 && selectedFriend !== friend && (
                <span className="ml-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-[9px] font-bold animate-pulse flex items-center">
                  <MessageSquare size={8} className="mr-1" /> {unreads}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative -mt-[1px]">
        {selectedFriend === "DIRECTORY" ? (
          <div className="w-full h-full bg-[#0c0c0c]/90 backdrop-blur-xl border border-matrix/20 rounded-b-lg p-6 overflow-y-auto custom-scrollbar font-mono">
            <h2 className="text-matrix text-lg font-bold mb-6 border-b border-matrix/20 pb-2 flex items-center">
              <Globe className="mr-2" /> GLOBAL DIRECTORY
            </h2>

            {/* Pending Incoming Requests */}
            {friendRequests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-yellow-500 text-sm font-bold mb-3 flex items-center">
                  <Clock size={14} className="mr-2" /> PENDING REQUESTS
                </h3>
                <div className="grid gap-2">
                  {friendRequests.map(req => (
                    <div key={req} className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                      <span className="text-yellow-500 text-sm font-bold">OP: {req}</span>
                      <div className="flex gap-2">
                        <button onClick={() => acceptRequest(req)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded transition-colors flex items-center">
                          <Check size={12} className="mr-1" /> ACCEPT
                        </button>
                        <button onClick={() => declineRequest(req)} className="border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500 px-3 py-1 text-xs font-bold rounded transition-colors flex items-center">
                          <X size={12} className="mr-1" /> DENY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Users List */}
            <div>
              <h3 className="text-matrix/70 text-sm font-bold mb-3">ALL REGISTERED OPERATIVES</h3>
              <div className="grid gap-2">
                {allUsers.length === 0 ? (
                  <div className="text-gray-500 text-xs italic p-4 border border-matrix/10 rounded">Scanning network for operatives...</div>
                ) : (
                  allUsers.map(user => {
                    const isFriend = friends.includes(user);
                    const hasPendingIncoming = friendRequests.includes(user);
                    const hasSentRequest = sentRequests.includes(user);
                    
                    return (
                      <div key={user} className="flex items-center justify-between border border-matrix/20 p-3 rounded hover:bg-matrix/5 transition-colors">
                        <span className="text-gray-300 text-sm font-bold">OP: {user}</span>
                        
                        {isFriend ? (
                          <span className="text-matrix/50 text-xs flex items-center"><Check size={12} className="mr-1"/> SECURE CHANNEL OPEN</span>
                        ) : hasPendingIncoming ? (
                          <span className="text-yellow-500/70 text-xs italic flex items-center"><Clock size={12} className="mr-1"/> Waiting for your approval above</span>
                        ) : hasSentRequest ? (
                          <span className="text-gray-500 text-xs italic flex items-center"><Clock size={12} className="mr-1"/> Request sent...</span>
                        ) : (
                          <button onClick={() => sendRequest(user)} className="border border-matrix/50 hover:bg-matrix/20 text-matrix px-3 py-1 text-xs rounded transition-colors flex items-center font-bold">
                            <UserPlus size={12} className="mr-1" /> SEND REQUEST
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : selectedFriend ? (
          <ChatTerminal
            id={`dm-${selectedFriend}`}
            title={`ENCRYPTED DM: ${selectedFriend}`}
            currentUser={currentUser}
            isTypingAnywhere={isTypingAnywhere}
            activeTypists={Object.keys(activeTypists)}
            onTypingChange={(isTyping) => onTypingChange(isTyping, `dm_${getRoomId(selectedFriend)}`)}
            channelName={`dm_${getRoomId(selectedFriend)}`}
            firebaseCollection={`private_chats/${getRoomId(selectedFriend)}/messages`}
            onMessageSent={handleMessageSent}
          />
        ) : null}
      </div>
    </div>
  );
}
