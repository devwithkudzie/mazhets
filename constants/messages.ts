export type ChatSummary = {
  id: string;
  seller: { id: string; name: string };
  lastMessage: string;
  timestamp: string; // ISO
};

export type ChatMessage = {
  id: string;
  chatId: string;
  from: "me" | "seller";
  text: string;
  createdAt: string; // ISO
};

// Dynamic chat storage - in a real app this would be in a database
let dynamicChatList: ChatSummary[] = [
  {
    id: "c1",
    seller: { id: "105", name: "FurniShop" },
    lastMessage: "Is the sofa still available?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "c2",
    seller: { id: "101", name: "Tech Store" },
    lastMessage: "Can you do $380?",
    timestamp: new Date(Date.now() - 3600_000).toISOString(),
  },
];

export const chatList = dynamicChatList;
export const CHAT_LIST_KEY = "@chat_list";
export const LOGGED_IN_KEY = "@logged_in";
export const CHAT_MSG_PREFIX = "@chat_msgs:"; // usage: CHAT_MSG_PREFIX + chatId

// Function to create or update a chat
export const createOrUpdateChat = (sellerId: string, sellerName: string, lastMessage: string) => {
  const existingChatIndex = dynamicChatList.findIndex(chat => chat.seller.id === sellerId);
  
  if (existingChatIndex >= 0) {
    // Update existing chat
    dynamicChatList[existingChatIndex] = {
      ...dynamicChatList[existingChatIndex],
      lastMessage,
      timestamp: new Date().toISOString(),
    };
  } else {
    // Create new chat
    const newChat: ChatSummary = {
      id: `c-${sellerId}`,
      seller: { id: sellerId, name: sellerName },
      lastMessage,
      timestamp: new Date().toISOString(),
    };
    dynamicChatList.unshift(newChat); // Add to beginning
  }
  
  return dynamicChatList;
};

export const chatMessages: ChatMessage[] = [
  { id: "m1", chatId: "c1", from: "seller", text: "Hi! The sofa is available.", createdAt: new Date(Date.now() - 7200_000).toISOString() },
  { id: "m2", chatId: "c1", from: "me", text: "Great! Can I view it today?", createdAt: new Date(Date.now() - 7000_000).toISOString() },
  { id: "m3", chatId: "c1", from: "seller", text: "Yes, after 5pm works.", createdAt: new Date(Date.now() - 6900_000).toISOString() },
  { id: "m6", chatId: "c1", from: "me", text: "Perfect! What's the address?", createdAt: new Date(Date.now() - 6800_000).toISOString() },
  { id: "m7", chatId: "c1", from: "seller", text: "123 Main St, Harare. I'll send you the exact location.", createdAt: new Date(Date.now() - 6700_000).toISOString() },
  { id: "m8", chatId: "c1", from: "me", text: "Thanks! See you at 5:30pm", createdAt: new Date(Date.now() - 6600_000).toISOString() },

  { id: "m4", chatId: "c2", from: "me", text: "Is the S20 negotiable?", createdAt: new Date(Date.now() - 4000_000).toISOString() },
  { id: "m5", chatId: "c2", from: "seller", text: "We can do $380.", createdAt: new Date(Date.now() - 3500_000).toISOString() },
  { id: "m9", chatId: "c2", from: "me", text: "Deal! When can I pick it up?", createdAt: new Date(Date.now() - 3400_000).toISOString() },
  { id: "m10", chatId: "c2", from: "seller", text: "Tomorrow after 2pm works for me.", createdAt: new Date(Date.now() - 3300_000).toISOString() },
  { id: "m11", chatId: "c2", from: "me", text: "Perfect! I'll bring cash.", createdAt: new Date(Date.now() - 3200_000).toISOString() },
];

// Quick reply templates
export const quickReplies = [
  "Is this still available?",
  "What's your best price?",
  "Can I see more photos?",
  "Where are you located?",
  "When can I pick it up?",
  "Is it negotiable?",
  "What's the condition?",
  "Thanks, I'll think about it",
];


