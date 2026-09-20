import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export type CatSummary = {
  name: string;
  slug: string;
};

export type CatDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  birthdate: string | null;
  departure_date: string | null;
  location: string | null;
  sort_order: number | null;
  is_current: boolean | null;
  nicknames: { nickname: string }[];
};
