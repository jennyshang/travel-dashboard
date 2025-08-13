
function normalize(v: any) {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(" ");
  return String(v);
}

export function filterTrips(trips: Trip[] = [], query: string) {
  if (!query || !query.trim()) return trips;
  const q = query.toLowerCase().trim();

  return trips.filter((t) => {
    const fields = [
      normalize(t.name),
      normalize(t.country),
      normalize(t.estimatedPrice),
      normalize(t.duration),
      normalize(t.interests),
      normalize(t.groupType),
      normalize(t.travelStyle),
      normalize(t.budget),
    ]
      .join(" ")
      .toLowerCase();

    return fields.includes(q);
  });
}

