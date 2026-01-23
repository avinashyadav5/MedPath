// Convert city name to coordinates using OpenStreetMap Nominatim
export async function geocodeCity(city) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
            headers: {
                "User-Agent": "MedPathAI/1.0",
            },
        });
        if (!response.ok) {
            throw new Error("Geocoding failed");
        }
        const data = await response.json();
        if (data.length === 0) {
            return null;
        }
        return {
            lat: Number.parseFloat(data[0].lat),
            lon: Number.parseFloat(data[0].lon),
            display_name: data[0].display_name,
        };
    }
    catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}
// Fetch nearby hospitals using Overpass API
export async function fetchNearbyHospitals(lat, lon, radius = 10000, // 10km in meters
    tags = ["hospital", "clinic", "doctors"]) {
    try {
        // Build simpler Overpass query focused on hospitals and clinics only
        const query = `
      [out:json][timeout:15];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        way["amenity"="clinic"](around:${radius},${lat},${lon});
      );
      out body center 20;
    `;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            console.warn(`Overpass API returned ${response.status}, returning empty results`);
            return [];
        }
        const data = await response.json();
        // Process and filter results
        const hospitals = data.elements
            .filter((el) => {
                if (!el.tags?.name)
                    return false;
                // If strict tags are provided (excluding generic defaults), filter by them
                const isGenericQuery = tags.length === 3 && tags.includes("hospital") && tags.includes("clinic");
                if (isGenericQuery)
                    return true;
                const name = el.tags.name.toLowerCase();
                const specialty = (el.tags["healthcare:speciality"] || "").toLowerCase();
                // Check if any tag matches the name or specialty
                return tags.some(tag => {
                    const t = tag.toLowerCase();
                    return name.includes(t) || specialty.includes(t) || t === "hospital"; // Keep generic hospitals if explicitly tagged
                });
            })
            .map((el) => {
                const elLat = el.lat || el.center?.lat || 0;
                const elLon = el.lon || el.center?.lon || 0;
                return {
                    id: el.id.toString(),
                    name: el.tags.name,
                    type: el.tags.amenity || el.tags.healthcare || "medical",
                    lat: elLat,
                    lon: elLon,
                    distance: calculateDistance(lat, lon, elLat, elLon),
                    address: formatAddress(el.tags),
                    phone: el.tags.phone || el.tags["contact:phone"],
                    website: el.tags.website || el.tags["contact:website"],
                    tags: el.tags,
                };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20); // Limit to 20 results
        return hospitals;
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            console.warn("Overpass API timeout - continuing without hospital data");
        }
        else {
            console.warn("Overpass API error:", error);
        }
        return [];
    }
}
// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
function formatAddress(tags) {
    const parts = [];
    if (tags["addr:street"]) {
        parts.push(tags["addr:housenumber"] ? `${tags["addr:housenumber"]} ${tags["addr:street"]}` : tags["addr:street"]);
    }
    if (tags["addr:city"])
        parts.push(tags["addr:city"]);
    if (tags["addr:postcode"])
        parts.push(tags["addr:postcode"]);
    return parts.join(", ") || "";
}
