// Hand-maintained subset of the Supabase schema for Phase 1.
// Replace with `supabase gen types typescript` output once the project is linked.

export type UserRole = "customer" | "professional" | "company" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface City {
  id: string;
  name: string;
  province: string | null;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  type: "service" | "product";
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category_ids: string[];
  city_id: string | null;
  province: string | null;
  country: string;
  about: string | null;
  experience_years: number | null;
  website: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  maps_link: string | null;
  verification_status: VerificationStatus;
}

export interface Professional {
  id: string;
  profile_id: string;
  company_id: string | null;
  designation: string | null;
  category_ids: string[];
  services: string[];
  experience_years: number | null;
  about: string | null;
  slug: string;
}

export interface SearchResult {
  type: "company" | "professional" | "product";
  id: string;
  name: string;
  slug: string;
  city: string | null;
  category_ids: string[];
  verified: boolean;
}
