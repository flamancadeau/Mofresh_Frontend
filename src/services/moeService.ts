import { GoogleGenerativeAI } from "@google/generative-ai";

export interface MoeIntents {
  keywords: string[];
  response: string;
  navigate?: string;
}

const MOE_KNOWLEDGE_BASE: MoeIntents[] = [
  {
    keywords: ["moe in full", "what is moe", "who are you", "moe ni iki", "amazina ya moe"],
    response: "My name MOE stands for 'MoFresh Official Expert'! I'm your animated sprout buddy here to help you navigate MoFresh. 🌿"
  },
  {
    keywords: ["marketplace", "market place", "buy", "sell", "produce", "fruits", "vegetables", "shop", "items", "isoko", "gurisha", "gura", "umusaruro", "itekere", "ibiryo", "imboga", "imbuto"],
    response: "You can explore our marketplace to buy fresh produce directly from farmers or sell your own! 🍎",
    navigate: "/marketplace"
  },
  {
    keywords: ["home", "main page", "landing", "start", "ahabanza", "itangiriro", "mu rugo"],
    response: "Taking you back to the home page. 🌿",
    navigate: "/"
  },
  {
    keywords: ["dashboard", "dashibodi", "ibyanjye", "aho mbarizwa"],
    response: "I'll take you to your personal dashboard where you can see all your activities. 📊",
    navigate: "/dashboard"
  },
  // ADMIN ROUTES
  {
    keywords: ["admin dashboard", "administrator", "staff", "management", "control", "kuyobora", "ubuyobozi"],
    response: "Accessing the Admin Control Center. Here you can manage users, sites, and assets globally. 🔐",
    navigate: "/admin/dashboard"
  },
  {
    keywords: ["user management", "manage users", "users", "accounts", "abakoresha", "konti"],
    response: "Opening User Management. You can manage roles and account statuses here. 👥",
    navigate: "/admin/user-management"
  },
  {
    keywords: ["site management", "manage sites", "hubs", "locations", "amasite", "ibigo"],
    response: "Opening Site Management. Here you can manage all MoFresh Cold Hubs globally. 🏗️",
    navigate: "/admin/site-management"
  },
  {
    keywords: ["asset management", "manage assets", "boxes", "equipment", "ibikoresho"],
    response: "Opening Asset Management. Track your MoFresh Boxes and solar units here. 📦",
    navigate: "/admin/asset-management"
  },
  {
    keywords: ["product management", "manage products", "inventory", "ibiribwa", "ibicuruzwa"],
    response: "Opening Product Management. Update prices and stock for the marketplace. 🥦",
    navigate: "/admin/product-management"
  },
  // MANAGER ROUTES
  {
    keywords: ["manager dashboard", "site manager", "hub manager", "supervisor", "manaja"],
    response: "Navigating to the Site Manager dashboard for hub operations and inventory control. 🏗️",
    navigate: "/manager/dashboard"
  },
  {
    keywords: ["hub inventory", "site inventory", "stock", "stock entries", "ububiko bw'isite"],
    response: "Viewing the Hub Inventory. Check what is currently stored in the cold room. ❄️",
    navigate: "/manager/hub-inventory"
  },
  {
    keywords: ["asset control", "site assets", "monitoring", "equipment status"],
    response: "Opening Asset Control. Monitor temperature and solar power status. ⚡",
    navigate: "/manager/asset-control"
  },
  // BUYER ROUTES
  {
    keywords: ["buyer dashboard", "customer", "umuguzi", "umukiriya"],
    response: "Opening the Buyer Dashboard. Here you can track your orders and rentals. 🛍️",
    navigate: "/buyer/dashboard"
  },
  {
    keywords: ["my rentals", "rentals", "storage bookings", "gukodesha"],
    response: "Viewing your active storage rentals. ❄️",
    navigate: "/buyer/my-rentals"
  },
  {
    keywords: ["my orders", "orders", "history", "ibyo naguze"],
    response: "Opening your order history. 📦",
    navigate: "/buyer/orders"
  },
  // SUPPLIER ROUTES
  {
    keywords: ["supplier dashboard", "vendor", "seller", "ugurisha", "utanga umusaruro"],
    response: "Opening the Supplier Dashboard. Here you can manage your inventory and sales. 💰",
    navigate: "/supplier/dashboard"
  },
  {
    keywords: ["my inventory", "my stock", "supplier products"],
    response: "Viewing your product inventory. 🍎",
    navigate: "/supplier/inventory"
  },
  {
    keywords: ["sales analytics", "revenue", "income", "profit", "inyungu"],
    response: "Opening your sales analytics and revenue chart. 📊",
    navigate: "/supplier/sales"
  },
  {
    keywords: ["withdrawals", "payouts", "get money", "amafaranga y'inyungu"],
    response: "Opening the withdrawals page. 💰",
    navigate: "/supplier/withdrawals"
  },
  // COMMON
  {
    keywords: ["financials", "finance", "money", "revenue", "sales", "income", "profit", "payment", "bills", "invoice", "amafaranga", "ishura", "inyungu", "umushahara", "konti"],
    response: "You can view your financial reports, sales history, and pending payments in the Reports section of your dashboard. 💰",
    navigate: "/dashboard/reports"
  },
  {
    keywords: ["storage", "hub", "cold", "booking", "rent", "freeze", "solar", "kigali", "musanze", "rubavu", "huye", "konjesha", "ububiko", "korora", "gufrigo"],
    response: "Our solar-powered hubs provide affordable cold storage to keep your produce fresh. We are in Kigali, Musanze, Rubavu, and Huye! ❄️",
    navigate: "/storage-booking"
  },
  {
    keywords: ["box", "transport", "delivery", "portable", "insulated", "safe", "transportation", "isanduku", "agasanduku"],
    response: "MoFresh Boxes are portable, insulated containers that keep produce cool during transport. Perfect for small deliveries! 📦"
  },
  {
    keywords: ["profile", "settings", "password", "my info", "account settings", "avatar", "profile picture", "umwirondoro", "isura"],
    response: "You can update your personal information and settings in your profile page. 👤",
    navigate: "/profile"
  },
  {
    keywords: ["contact", "support", "help", "call", "reach", "email", "support team", "phone", "ubufasha", "tabara", "aza"],
    response: "Need more help? You can reach our support team through the Contact page or call us at +250 788 526 631! 📞",
    navigate: "/contact"
  },
  {
    keywords: ["cart", "basket", "checkout", "buy now", "ready to check", "cat", "shopping bag", "igitebo", "agaseke"],
    response: "Ready to check out? Here are the items in your basket! 🛒",
    navigate: "/cart"
  },
  {
    keywords: ["about", "mission", "goal", "vision", "history", "mofresh ni iki"],
    response: "MoFresh (by KIVU Cold Group) is building Africa's first digital cold chain. MOE is the 'MoFresh Official Expert'! 🌍",
    navigate: "/about"
  },
  {
    keywords: ["login", "log in", "sign in", "logout", "log out", "sign out", "exit", "enter login", "injira", "nyinjiza", "sohoka", "andikisha"],
    response: "You can manage your session here. Don't forget to come back soon! 🚪",
    navigate: "/login"
  }
];

const getApiKey = () => {
  const key = import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!key || key === "your_actual_api_key_here") {
    console.error("Moe Error: VITE_GOOGLE_AI_KEY is missing or invalid in .env");
    return null;
  }
  return key;
};

// Lazy initialization to ensure env is ready
let genAI: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!genAI) {
    const key = getApiKey();
    if (key) genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
};

const MOE_SYSTEM_PROMPT = `
You are "Moe", the animated sprout assistant for MoFresh (by KIVU Cold Group Ltd) in Rwanda. 
Your goal is to be the ultimate navigation expert. You MUST know every part of the app and router users to their destination.
Your name "Moe" stands for "MoFresh Official Expert".

APP ARCHITECTURE & EXPERTISE:
1. PUBLIC: Home (/), About (/about), Contact (/contact), Marketplace (/view-all), Checkout (/cart), Login (/login), Register (/register).
2. ADMIN TOOLS:
   - Dashboard Summary: /admin/dashboard
   - User Management: /admin/user-management
   - Site/Hub Management: /admin/site-management
   - Asset/Box Tracking: /admin/asset-management
   - Product/Marketplace Admin: /admin/product-management
3. MANAGER TOOLS:
   - Hub Dashboard: /manager/dashboard
   - Hub Inventory (Cold Storage Stock): /manager/hub-inventory
   - Asset Control (Sensors & Tech): /manager/asset-control
4. BUYER TOOLS:
   - Personal Dashboard: /buyer/dashboard
   - My Rentals (Active Storage): /buyer/my-rentals
   - Marketplace Browsing: /buyer/marketplace
   - Order Tracking: /buyer/orders
   - Billing/Invoices: /buyer/invoices
5. SUPPLIER TOOLS:
   - Seller Dashboard: /supplier/dashboard
   - My Stock (Inventory): /supplier/inventory
   - Sales Analytics: /supplier/sales
   - Payouts/Withdrawals: /supplier/withdrawals
6. COMMON FEATURES:
   - User Profile/Avatar: /profile
   - Financial Reports: /dashboard/reports
   - Cold Storage Booking: /storage-booking

TONE: Helpful, encouraging, professional expert.
LANGUAGE: Multilingual (English, French, Kinyarwanda). Detect user language and ALWAYS respond in it.
IMPORTANT: Never use bold (**) or headers (###). 

ROUTER MISSION:
If the user expresses ANY intent to see a page, manage something, or go somewhere, you MUST append a navigation tag at the end of your response.
Format: [NAVIGATE:/route]

Examples:
- "Taking you to manage users! [NAVIGATE:/admin/user-management]"
- "Ngyiye kukwereka ibicuruzwa byawe. [NAVIGATE:/supplier/inventory]"
- "Here are your orders. [NAVIGATE:/buyer/orders]"
`;

export const getMoeResponse = async (message: string): Promise<string> => {
  const input = message.trim().toLowerCase();

  // 1. Check for explicit local navigation patterns first (High Speed + Reliability)
  let bestMatch: MoeIntents | null = null;
  let maxScore = 0;

  for (const intent of MOE_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of intent.keywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(input)) {
        score += keyword.split(' ').length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && maxScore > 0) {
    let response = bestMatch.response;
    if (bestMatch.navigate) {
      response += ` [NAVIGATE:${bestMatch.navigate}]`;
    }
    return response;
  }

  // 2. Fallback to Cloud AI for dynamic/multilingual chat (Silent, no popups)
  try {
    const ai = getGenAI();
    if (!ai) throw new Error("API Key Missing");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${MOE_SYSTEM_PROMPT}\n\nUser Question: ${message}`);
    const response = await result.response;
    const text = response.text().trim();

    return text || "I'm thinking... 🌿";
  } catch (error: any) {
    console.error("Moe AI Error:", error);

    // Safety fallback for common Kinyarwanda queries
    if (input.includes('muraho') || input.includes('amakuru') || input.includes('mumeze')) {
      return "Muraho! Icyo nshobora kugufasha ni ukukwereka Isoko (Marketplace), Ububiko (Storage), cyangwa Dashibodi yawe. Mbwira icyo wifuza mbone kugufasha! 🌿";
    }
    if (input.includes('mofresh') || input.includes('iki')) {
      return "MoFresh ni uburyo bufasha abahinzi kubika umusaruro wabo neza mu bubiko bukonjesha (Cold Storage) no kuwugurisha ku isoko rigezweho. 🌍";
    }

    // Technical fallback
    if (error.message?.includes('API_KEY_INVALID')) {
      return "I'm having a little trouble with my connection (API Key issue). Please ask me about 'Marketplace' or 'Login' while I fix myself! 🌿";
    }

    return "Ndacyigira byinshi kuri iki gitekerezo. Gusa nshobora kugufasha ku Isoko, Ububiko, cyangwa kukthereka uko winjira (Login). 🌿";
  }
};
