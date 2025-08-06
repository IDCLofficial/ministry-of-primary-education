"use client"

import React, { useState } from "react";

interface MediaSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const MediaSearchBar: React.FC<MediaSearchBarProps> = ({ placeholder = "Search", onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="flex w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="flex-1 border border-gray-300 rounded-l text-white px-4 py-2 focus:outline-none"
      />
      <button
        type="button"
        className="bg-green-600 text-white px-8 py-2 rounded-r font-semibold"
        tabIndex={-1}
        disabled
        style={{ opacity: 0.5, pointerEvents: 'none' }}
      >
        Search
      </button>
    </div>
  );
};

export default MediaSearchBar; 