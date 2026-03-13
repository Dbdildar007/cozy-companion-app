export const CATEGORIES = [
  { id: 1, name: "Skincare",    icon: "✨", count: 1240, color: "#FDF0F5" },
  { id: 2, name: "Makeup",      icon: "💄", count: 890,  color: "#FFE8E8" },
  { id: 3, name: "Haircare",    icon: "💇‍♀️", count: 670,  color: "#E8F4FF" },
  { id: 4, name: "Fragrance",   icon: "🌸", count: 340,  color: "#F0E8FF" },
  { id: 5, name: "Wellness",    icon: "🌿", count: 520,  color: "#E8FFE8" },
  { id: 6, name: "Bath & Body", icon: "🛁", count: 430,  color: "#FFF8E8" },
  { id: 7, name: "Nails",       icon: "💅", count: 280,  color: "#FFE8F5" },
  { id: 8, name: "Men's",       icon: "🧴", count: 310,  color: "#E8F0FF" },
];

export const BRANDS = [
  { id: 1, name: "Lumière",   logo: "L✦", tagline: "French Luxury" },
  { id: 2, name: "Verdura",   logo: "V❋", tagline: "Natural Organic" },
  { id: 3, name: "Obsidian",  logo: "O◈", tagline: "Bold & Dark" },
  { id: 4, name: "Sakura",    logo: "S✿", tagline: "Japanese Ritual" },
  { id: 5, name: "AuraCraft", logo: "A⊛", tagline: "Handcrafted" },
  { id: 6, name: "NovaDerm",  logo: "N◎", tagline: "Science First" },
];

export const PRODUCTS = [
  { id: 1,  name: "Rose Quartz Serum",      brand: "Lumière",   category: "Skincare",    price: 2499, mrp: 3200, rating: 4.7, reviews: 1240, image: "🌹", badge: "Bestseller", discount: 22, inStock: true  },
  { id: 2,  name: "Velvet Matte Lip",       brand: "Obsidian",  category: "Makeup",      price: 649,  mrp: 850,  rating: 4.5, reviews: 3420, image: "💄", badge: "New",        discount: 24, inStock: true  },
  { id: 3,  name: "Argan Oil Treatment",    brand: "Verdura",   category: "Haircare",    price: 1199, mrp: 1500, rating: 4.8, reviews: 890,  image: "🌿", badge: "Organic",    discount: 20, inStock: true  },
  { id: 4,  name: "Cherry Blossom EDP",     brand: "Sakura",    category: "Fragrance",   price: 3899, mrp: 4500, rating: 4.6, reviews: 567,  image: "🌸", badge: "Luxury",     discount: 13, inStock: true  },
  { id: 5,  name: "Vitamin C Brightening",  brand: "NovaDerm",  category: "Skincare",    price: 1799, mrp: 2200, rating: 4.9, reviews: 2100, image: "✨", badge: "Top Rated",  discount: 18, inStock: true  },
  { id: 6,  name: "Midnight Kajal",         brand: "Obsidian",  category: "Makeup",      price: 299,  mrp: 399,  rating: 4.4, reviews: 5600, image: "🖤", badge: null,         discount: 25, inStock: true  },
  { id: 7,  name: "Collagen Gummy Bears",   brand: "AuraCraft", category: "Wellness",    price: 999,  mrp: 1299, rating: 4.3, reviews: 780,  image: "🫐", badge: "Trending",   discount: 23, inStock: true  },
  { id: 8,  name: "Lavender Body Butter",   brand: "Verdura",   category: "Bath & Body", price: 799,  mrp: 999,  rating: 4.6, reviews: 1050, image: "💜", badge: null,         discount: 20, inStock: false },
  { id: 9,  name: "Gel Nail Kit Pro",       brand: "AuraCraft", category: "Nails",       price: 1499, mrp: 1999, rating: 4.7, reviews: 430,  image: "💅", badge: "Kit",        discount: 25, inStock: true  },
  { id: 10, name: "Charcoal Face Wash",     brand: "NovaDerm",  category: "Skincare",    price: 449,  mrp: 599,  rating: 4.5, reviews: 2890, image: "⚫", badge: null,         discount: 25, inStock: true  },
  { id: 11, name: "Beard Grooming Oil",     brand: "Obsidian",  category: "Men's",       price: 699,  mrp: 899,  rating: 4.6, reviews: 920,  image: "🧔", badge: "For Him",    discount: 22, inStock: true  },
  { id: 12, name: "Hyaluronic Toner",       brand: "Lumière",   category: "Skincare",    price: 1349, mrp: 1800, rating: 4.8, reviews: 1670, image: "💧", badge: "Hydrating",  discount: 25, inStock: true  },
  { id: 13, name: "Matte Foundation SPF30", brand: "Lumière",   category: "Makeup",      price: 1899, mrp: 2400, rating: 4.6, reviews: 980,  image: "🎨", badge: "New",        discount: 21, inStock: true  },
  { id: 14, name: "Keratin Hair Mask",      brand: "Verdura",   category: "Haircare",    price: 899,  mrp: 1199, rating: 4.7, reviews: 1100, image: "🌾", badge: null,         discount: 25, inStock: true  },
  { id: 15, name: "Oud Noir Parfum",        brand: "Sakura",    category: "Fragrance",   price: 4999, mrp: 6000, rating: 4.8, reviews: 340,  image: "🕯️", badge: "Luxury",     discount: 17, inStock: true  },
  { id: 16, name: "Retinol Night Cream",    brand: "NovaDerm",  category: "Skincare",    price: 2199, mrp: 2800, rating: 4.9, reviews: 1560, image: "🌙", badge: "Bestseller", discount: 21, inStock: true  },
];

export const BANNERS = [
  { id: 1, title: "Monsoon Glow Sale",      subtitle: "Up to 50% off on skincare essentials", cta: "Shop Skincare",   bg: "linear-gradient(135deg,#C8507A 0%,#7B1D42 100%)", emoji: "🌹" },
  { id: 2, title: "New Arrivals Drop",      subtitle: "Fresh picks from 20+ premium brands",  cta: "Explore Now",     bg: "linear-gradient(135deg,#FF9E4A 0%,#C8507A 100%)", emoji: "✨" },
  { id: 3, title: "Luxury Fragrance Edit",  subtitle: "Discover your signature scent",        cta: "Shop Fragrances", bg: "linear-gradient(135deg,#5B2D8E 0%,#C8507A 100%)", emoji: "🌸" },
];

export const OFFERS = [
  { icon: "🚚", title: "Free Delivery",   desc: "On orders above ₹499" },
  { icon: "↩️",  title: "Easy Returns",    desc: "30-day hassle-free" },
  { icon: "🔒", title: "Secure Payment", desc: "100% safe checkout" },
  { icon: "⭐", title: "GlowPoints",     desc: "Earn on every order" },
  { icon: "🎁", title: "Gift Wrapping",  desc: "Available at checkout" },
];

export const MOCK_ORDERS = [
  { id: "GV2024001", date: "12 Mar 2024", status: "Delivered",        items: ["Rose Quartz Serum", "Velvet Matte Lip"],     total: 3148, color: "#1E9E62" },
  { id: "GV2024002", date: "8 Mar 2024",  status: "Out for Delivery", items: ["Cherry Blossom EDP"],                        total: 3899, color: "#FF9E4A" },
  { id: "GV2024003", date: "2 Mar 2024",  status: "Processing",       items: ["Vitamin C Brightening", "Gel Nail Kit Pro"], total: 3298, color: "#3498db" },
];

export const TRENDING_SEARCHES = [
  "Serum", "Lip Gloss", "Vitamin C", "SPF 50", "Hair Mask", "Retinol", "Toner", "BB Cream",
];

export const SETTINGS_ITEMS = [
  { icon: "🔔", label: "Notifications",    desc: "Push, Email & SMS" },
  { icon: "💳", label: "Payment Methods",  desc: "Cards, UPI, Wallets" },
  { icon: "🎁", label: "GlowPoints",       desc: "2,840 points earned" },
  { icon: "🔒", label: "Privacy & Security", desc: "Password, 2FA" },
  { icon: "💬", label: "Help & Support",   desc: "Chat, Email support" },
  { icon: "⭐", label: "Rate the App",     desc: "Share feedback" },
];
