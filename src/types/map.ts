export interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  state?: string;
  postcode?: string;
  country?: string;
  amenity?: string;
  leisure?: string;
  sport?: string;
  building?: string;
  tourism?: string;
  shop?: string;
  historic?: string;
  railway?: string;
  aeroway?: string;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: NominatimAddress;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    leisure?: string;
    sport?: string;
    building?: string;
    [key: string]: string | undefined;
  };
}

export interface OverpassResponse {
  elements?: OverpassElement[];
}
