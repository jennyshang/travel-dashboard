import { Link, useLocation } from "react-router"
import { cn, getFirstWord } from "~/lib/utils";
import { ChipListComponent, ChipsDirective, ChipDirective } from '@syncfusion/ej2-react-buttons';
import * as React from 'react';

const TripCard = ({ id, name, location, imageUrl, tags, price, onDelete, deleting, onToggleSave, isSaved, saving }: TripCardProps) => {
    const path = useLocation();
    return (
        <Link to={path.pathname === '/' || path.pathname.startsWith('/travels') ? `/travel/${id}` : `/trips/${id}`} className="trip-card">

            {/* only render delete button when onDelete is passed */}
            {onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        // Prevent the Link navigation when clicking the delete button
                        e.preventDefault();
                        e.stopPropagation();
                        if (onDelete) onDelete();
                    }}
                    disabled={deleting}
                    aria-label="Delete trip"
                    title="Delete trip"
                    className={`absolute top-2 left-2 z-10 p-1 rounded-full shadow-sm bg-white/90 transition-colors duration-150 focus:outline-none ${deleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                        }`}
                >
                    {deleting ? (
                        <span className="text-xs">…</span>
                    ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            )}
            {/* user-facing "save" heart button (renders only when parent passes onToggleSave) */}
            {onToggleSave && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (saving) return;
                        if (onToggleSave) onToggleSave();
                    }}
                    aria-label={isSaved ? "Unsave trip" : "Save trip"}
                    title={isSaved ? "Unsave trip" : "Save trip"}
                    className={`absolute top-2 left-2 z-10 p-1 rounded-full shadow-sm bg-white/90 transition-colors duration-150 focus:outline-none pointer-events-auto ${saving ? 'opacity-60 cursor-wait' : 'hover:bg-gray-200'}`}
                >
                    {saving ? (
                        <span className="text-xs">…</span>
                    ) : isSaved ? (
                        // filled heart (saved) — now uses the same path as the outline heart, but filled
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M20.8 8.6c0 4.2-5.2 8.2-8.8 10.6-3.6-2.4-8.8-6.4-8.8-10.6 0-2.7 2.1-4.9 4.8-4.9 1.8 0 3.4 1 4.4 2.4.99-1.36 2.64-2.4 4.4-2.4 2.7 0 4.8 2.2 4.8 4.9z" />
                        </svg>
                    ) : (
                        // outline heart (not saved)
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20.8 8.6c0 4.2-5.2 8.2-8.8 10.6-3.6-2.4-8.8-6.4-8.8-10.6 0-2.7 2.1-4.9 4.8-4.9 1.8 0 3.4 1 4.4 2.4.99-1.36 2.64-2.4 4.4-2.4 2.7 0 4.8 2.2 4.8 4.9z" />
                        </svg>
                    )}
                </button>
            )}
            <img src={imageUrl} alt={name} />

            <article>
                <h2>{name}</h2>
                <figure>
                    <img src="/assets/icons/location-mark.svg" alt="location" className="size-4" />
                    <figcaption>{location}</figcaption>
                </figure>
            </article>

            <div className="mt-5 pl-[18px] pr-3.5 pb-5">
                <ChipListComponent id="travel-chip">
                    <ChipsDirective>
                        {tags.map((tag, index) => (
                            <ChipDirective
                                key={index}
                                text={getFirstWord(tag)}
                                cssClass={cn(index === 1 ? '!bg-pink-50 !text-pink-500' : '!bg-success-50 !text-success-700')}>

                            </ChipDirective>

                        ))}
                    </ChipsDirective>
                </ChipListComponent>


            </div>

            <article className="tripCard-pill">{price}</article>

        </Link>
    )
}

export default TripCard