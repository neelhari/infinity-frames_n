// Central brand config for Infinity Frames N
export const BRAND = {
  name: "Infinity Frames N",
  tagline: "Turn Your Memories Into Lasting Gifts",
  subTagline: "Customized Gifts • 3D Prints • Photo Frames • Lamps • Keychains",
  motto: "Customized 3D Gifts for Every Emotion",

  ownerName: "Naresh",
  ownerFullName: "Naresh Kukkala",

  phone: "9494066914",
  whatsappNumber: "919494066914",
  email: "infinityframesn@gmail.com",
  domain: "infinityframesn.com",
  websiteUrl: "https://infinityframesn.com",

  address: {
    line1: "Near Bheemeswara Swami Temple",
    line2: "Opp Mandalam Ravichattu, 1st Floor",
    city: "Drakshramam",
    pincode: "533262",
    mandal: "Ramchandrapuram Mandal",
    district: "Dr. B.R. Ambedkar Konaseema District",
    full: "Near Bheemeswara Swami Temple, Opp Mandalam Ravichattu, 1st Floor, Drakshramam - 533262, Ramchandrapuram Mandal, Dr. B.R. Ambedkar Konaseema District",
  },

  instagramHandle: "@infinityframesn",

  about: `Infinity Frames N is a customized gifting and 3D-printing business specializing in unique, personalized and decorative products. We manufacture customized photo products, lamps, frames, keychains, devotional products, glow-in-the-dark products, aquarium decorations, customized models and other 3D-printed gifts. We serve both individual customers and wholesale/bulk buyers.`,

  collectionHighlights: [
    "Customized Gifts",
    "3D Printed Products",
    "Photo Frames",
    "Lithophane Products",
    "Customized Lamps",
    "Moon Lamps",
    "Devotional Lamps",
    "Keychains",
    "Glow-in-the-Dark Products",
    "Aquarium Decorations",
    "Customized Models",
    "Wholesale & Bulk Orders",
  ],

  freeShippingThreshold: 1499,
};

export function waLink(message) {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
