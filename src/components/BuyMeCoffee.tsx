import React from 'react';

export const BuyMeCoffee = () => {
  return (
    <a
      href="https://buymeacoffee.com/jackami"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-neutral-900 font-bold rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:ring-offset-2 focus:ring-offset-neutral-950 min-h-[44px]"
      aria-label="Buy me a coffee"
    >
      <span className="text-xl" role="img" aria-label="coffee">☕️</span>
      <span className="font-sans font-semibold">Buy me a coffee</span>
    </a>
  );
};
