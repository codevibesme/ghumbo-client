// Backend shapes for /countries and /destinations.

export type Asset = {
  url: string;
  type: "image" | "video";
  label: string | null;
  description: string | null;
  thumbnail_url: string | null;
  sort_order: number;
};

export type PlaceStatus = "live" | "coming_soon";

export type Country = {
  id: number;
  status: PlaceStatus;
  name: string;
  /** ISO 3166-1 alpha-2, upper case. */
  code: string;
  assets: Asset[];
};

export type Destination = {
  id: number;
  countryId: number;
  status: PlaceStatus;
  name: string;
  slug: string;
  overview: string;
  assets: Asset[];
};
