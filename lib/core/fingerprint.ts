import detectIncognito from "../internal/incognito.ts";

interface Fingerprint {
  browserName: string;
  browserVersion: string;
  incognito: boolean;
  ip: string;
  type: string;
  ipLocation: {
    city: { name: string };
    continent: { code: string; name: string };
    country: { code: string; name: string };
    region: { code: string; name: string };
    latitude: number;
    longitude: number;
    postalCode: string;
    timezone: string;
    org: string;
    asn: number;
  };
  language: string;
  os: string;
  osVersion: string;
  maxTouchPoints: number;
  hardwareConcurrency: number;
}

interface IpRes {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  postal: string;
  connection: {
    asn: number;
    org: string;
    isp: string;
  };
  timezone: {
    id: string;
    abbr: string;
  };
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
  if (
    typeof globalThis.document === "undefined" ||
    typeof navigator === "undefined"
  ) {
    throw new Error("Must be in a browser environment");
  }

  if (navigator.doNotTrack === "1") {
    return {
      fingerprint: (
        await hashFingerprint({
          browserName: crypto.randomUUID(),
          os: crypto.randomUUID(),
        } as Fingerprint)
      ).fingerprint,
      data: {
        browserName: "",
        browserVersion: "",
        incognito: true,
        ip: "",
        type: "Unknown",
        ipLocation: {
          city: { name: "Unknown" },
          continent: { code: "XX", name: "Unknown" },
          country: { code: "XX", name: "Unknown" },
          region: { code: "XX", name: "Unknown" },
          latitude: 0,
          longitude: 0,
          postalCode: "Unknown",
          timezone: "Unknown",
          org: "Unknown",
          asn: 0,
        },
        language: "Unknown",
        os: "",
        osVersion: "",
        hardwareConcurrency: 0,
        maxTouchPoints: 0,
      },
    };
  }

  const ip = await (async () => {
    try {
      const response = await fetch("https://ipwho.is/", {
        headers: {
          "cache-control": "max-age=3600",
        },
      });
      const data = (await response.json()) as IpRes;
      return data;
    } catch {
      return null;
    }
  })();

  if (!ip || !ip.success) {
    throw new Error("Failed to fetch IP or location data.");
  }

  const { hardwareConcurrency, maxTouchPoints, userAgent } = navigator;
  const { browserVersion, os, osVersion } = parseUserAgent(userAgent);

  const { isPrivate, browserName } = await detectIncognito();

  return hashFingerprint({
    browserName,
    browserVersion,
    incognito: isPrivate,
    ip: ip.ip,
    type: ip.type,
    ipLocation: {
      city: { name: ip.city },
      continent: {
        code: ip.continent_code,
        name: ip.continent,
      },
      country: {
        code: ip.country_code,
        name: ip.country,
      },
      region: {
        code: ip.region_code,
        name: ip.region,
      },
      latitude: ip.latitude,
      longitude: ip.longitude,
      postalCode: ip.postal,
      timezone: ip.timezone.id,
      org: ip.connection.org,
      asn: ip.connection.asn,
    },
    language: navigator.language,
    os,
    osVersion,
    maxTouchPoints,
    hardwareConcurrency,
  });
}

export async function hashFingerprint(data: Fingerprint) {
  const standardizedData: Fingerprint = {
    ...data,
    incognito: false,
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
    data: data,
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
