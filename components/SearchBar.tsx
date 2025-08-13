import React, { useEffect, useState } from "react";

type Props = {
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
    className?: string;
};

export default function SearchBar({
    placeholder = "Search trips, countries, price, duration, interests...",
    value = "",
    onChange,
    className = "",
}: Props) {
    const [q, setQ] = useState<string>(value);

    useEffect(() => setQ(value), [value]);

    useEffect(() => {
        const t = setTimeout(() => onChange?.(q), 300);
        return () => clearTimeout(t);
    }, [q, onChange]);

    return (
        <div
            role="search"
            className={
                "w-full max-w-4xl mx-auto flex items-center gap-3 px-4 py-2 rounded-full shadow-sm transition-colors " +
                "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 " +
                className
            }
        >
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-1.85z" />
                </svg>
            </div>

            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                aria-label="Search trips"
            />

            {q && (
                <button
                    onClick={() => {
                        setQ("");
                        onChange?.("");
                    }}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:text-white dark:hover:bg-black"
                    aria-label="Clear search"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}