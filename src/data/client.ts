// PartsPlus facts for the homepage. Source: veon/client.json (contacts, C-005..C-008, C-016, C-018, products_services).
export const phones = {
  kyivstar: { label: "098 900-94-94", href: "tel:+380989009494", operator: "Київстар" },
  vodafone: { label: "066 900-94-94", href: "tel:+380669009494", operator: "Vodafone" },
  lifecell: { label: "073 900-94-94", href: "tel:+380739009494", operator: "lifecell" },
  sto: { label: "093 911 94 94", href: "tel:+380939119494", operator: "СТО, запис" },
} as const;

export const channels = {
  telegram: "https://t.me/partsplus",
  viber: "viber://chat?number=%2B380739009494",
  email: "info@partsplus.com.ua",
  map: "https://www.google.com/maps/search/?api=1&query=%D0%9A%D0%B8%D1%97%D0%B2%2C+%D0%B2%D1%83%D0%BB.+%D0%A1%D0%B8%D1%80%D0%B5%D1%86%D1%8C%D0%BA%D0%B0%2C+31",
} as const;

// Confirmed profiles only (client.json socials, status confirmed).
export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/partsplus.com.ua/" },
  { name: "Facebook", href: "https://www.facebook.com/partsplus.com.ua" },
  { name: "YouTube", href: "https://www.youtube.com/@partsplus_ua" },
  { name: "Telegram", href: "https://t.me/partsplus" },
] as const;

export const address = { street: "вул. Сирецька, 31", city: "м. Київ", district: "Куренівка" } as const;

export const categories = [
  "Масла і автохімія",
  "Фільтри",
  "Гальмівна система",
  "Двигун і вихлоп",
  "Підвіска і рульове",
  "Коробка передач",
  "Охолодження, опалення",
  "Електрика, освітлення",
  "Кузов та елементи",
  "Аксесуари",
] as const;

export const brands = [
  "Bosch", "TRW", "ATE", "Varta", "Mannol", "Liqui Moly", "Blue Print",
  "Hepu", "Victor Reinz", "K&N", "WD-40", "Vitol", "Baseus", "Nostalgic-Art",
] as const;

export const nav = [
  { href: "#pick", label: "Підбір" },
  { href: "#catalog", label: "Каталог" },
  { href: "#sto", label: "СТО" },
  { href: "#service", label: "Доставка й оплата" },
  { href: "#contacts", label: "Контакти" },
] as const;
