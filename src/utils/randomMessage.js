// src/utils/randomMessage.js

const messages = [
  "🎄 Merry Christmas! May your heart be warm, your days be bright, and your season filled with joy ✨",
  "✨ Wishing you a cozy Christmas and a New Year full of hope, love, and little miracles 🎁",
  "🌟 May this Christmas bring peace to your heart, smiles to your home, and magic to every moment 💖",
  "🎅 Sending you warm Christmas wishes and gentle joy that lasts all season long 🔔",
  "❄️ Merry Christmas and Happy Holidays! May love, laughter, and light follow you wherever you go 🎄"

];

export const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};