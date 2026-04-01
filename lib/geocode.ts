export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence: "high" | "medium" | "low";
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });

  const res = await fetch(url, {
    headers: { "User-Agent": "ProposalEngine/1.0 (underwriter-ai-app)" },
    signal,
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  const result = data[0];
  const importance = parseFloat(result.importance ?? "0");

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name,
    confidence: importance > 0.6 ? "high" : importance > 0.3 ? "medium" : "low",
  };
}
