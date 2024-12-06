import detectIncognito from "../internal/incognito.ts";

interface Fingerprint {
  browserName: string;
  browserVersion: string;
  incognito: boolean;
  ip: string;
  ipLocation: {
    accuracyRadius: number;
    city: { name: string };
    continent: { code: string; name: string };
    country: { code: string; name: string };
    latitude: number;
    longitude: number;
    postalCode: string;
    subdivisions: { isoCode: string; name: string }[];
    timezone: string;
    org: string;
    asn: string;
    network: string;
    languages: string[];
  };
  os: string;
  osVersion: string;
}

/**
 * Fetches identity data from the browser and returns a hashed fingerprint.
 *
 * @return a hashed fingerprint and the standardized data
 */
export default async function fingerprint(): Promise<{
  fingerprint: string;
  data: Fingerprint;
}> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Must be in a browser environment");
  }

  const ip = await (async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  })();

  if (!ip) {
    throw new Error("Failed to fetch IP or location data.");
  }

  const userAgent = navigator.userAgent;
  const { browserVersion, os, osVersion } = parseUserAgent(userAgent);

  const { isPrivate, browserName } = await detectIncognito();

  return hashFingerprint({
    browserName,
    browserVersion,
    incognito: isPrivate,
    ip: ip.ip,
    ipLocation: {
      accuracyRadius: ip.accuracy ?? 5,
      city: { name: ip.city ?? "Unknown" },
      continent: {
        code: ip.continent_code ?? "XX",
        name: ip.continent_name ?? "Unknown",
      },
      country: {
        code: ip.country_code ?? "XX",
        name: ip.country_name ?? "Unknown",
      },
      latitude: ip.latitude ?? 0,
      longitude: ip.longitude ?? 0,
      postalCode: ip.postal ?? "Unknown",
      subdivisions: [
        { isoCode: ip.region_code ?? "Unknown", name: ip.region ?? "Unknown" },
      ],
      timezone: ip.timezone ?? "UTC",
      org: ip.org ?? "Unknown",
      asn: ip.asn ?? "Unknown",
      network: ip.network ?? "Unknown",
      languages: ip.languages?.split(",") ?? [],
    },
    os,
    osVersion,
  });
}

export async function hashFingerprint(data: Fingerprint) {
  const standardizedData: Fingerprint = {
    ...data,
    ip: "",
    incognito: false,
    ipLocation: {
      ...data.ipLocation,
      network: "",
    },
  };
  return {
    fingerprint: await crypto.subtle
      .digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(standardizedData)),
      )
      .then((hashBuffer) => {
        return Array.from(new Uint8Array(hashBuffer))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      }),
    data: standardizedData,
  };
}

function parseUserAgent(userAgent: string) {
  const uaData =
    /(?<browserName>[\w\s]+)\/(?<browserVersion>[\d\.]+)\s\((?<os>[\w\s]+)\sNT\s(?<osVersion>[\d\.]+).*?\)\s.*?(?<engine>[A-Za-z]+)\/(?<engineVersion>[\d\.]+)\s.*?(?<secondaryBrowser>[A-Za-z]+)\/(?<secondaryVersion>[\d\.]+)/
      .exec(
        userAgent,
      );
  return {
    browserVersion: uaData?.groups?.browserVersion ?? "Unknown",
    os: uaData?.groups?.os.trim() ?? "Unknown",
    osVersion: uaData?.groups?.osVersion ?? "Unknown",
    engine: uaData?.groups?.engine ?? "Unknown",
    engineVersion: uaData?.groups?.engineVersion ?? "Unknown",
    secondaryBrowser: uaData?.groups?.secondaryBrowser ?? "Unknown",
    secondaryVersion: uaData?.groups?.secondaryVersion ?? "Unknown",
  };
}
