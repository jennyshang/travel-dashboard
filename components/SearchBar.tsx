import React, { useState, useEffect } from "react";

interface SearchBarProps {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value = "",
    placeholder = "Search trips by name, country, price, duration, interests...",
    onChange,
    className = "",
}) => {
    const [query, setQuery] = useState<string>(value);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setQuery(v);
        onChange?.(v);
    };

    return (
        <div className={`search-bar relative w-full ${className}`}>
            <input
                aria-label="Quick search"
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-surface-700 placeholder:text-gray-400 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
                type="button"
                onClick={() => {
                    setQuery("");
                    onChange?.("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70"
                aria-label="Clear search"
            >
                Clear
            </button>
        </div>
    );
};

export default SearchBar;

