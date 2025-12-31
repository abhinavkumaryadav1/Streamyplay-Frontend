import { IoSearch } from "react-icons/io5";
import { useState } from "react";

export default function MobileSearchBar() {
  const [search, setSearch] = useState("");

  // You can add navigation or search logic here
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement search logic or navigation
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sm:hidden fixed top-14 left-0 w-full z-30 bg-white px-2 py-2 border-b border-gray-200 flex items-center gap-2"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search"
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
        aria-label="Search"
      />
      <button
        type="submit"
        className="bg-gray-100 border border-gray-300 rounded-full p-2 ml-1 hover:bg-gray-200"
        aria-label="Search"
      >
        <IoSearch className="text-xl text-gray-700" />
      </button>
    </form>
  );
}
