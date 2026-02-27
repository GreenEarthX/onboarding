import { getCertificationPool, getCert2Pool } from "./external-dbs";

function splitName(fullName: string) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstName: null as string | null, lastName: null as string | null };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function upsertCertificationUser(params: {
  email: string;
  name: string;
  authId: string; // onboarding User.id
}) {
  const { firstName, lastName } = splitName(params.name);

  // certification DB table: public.users
  // unique: email
  const sql = `
    INSERT INTO public.users (email, first_name, last_name, auth0sub, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (email)
    DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name  = EXCLUDED.last_name,
      auth0sub   = EXCLUDED.auth0sub
    RETURNING user_id;
  `;

  const res = await getCertificationPool().query(sql, [params.email, firstName, lastName, params.authId]);
  return res.rows[0]?.user_id as number | undefined;
}

export async function upsertCert2User(params: {
  email: string;
  name: string;
  authId: string; // onboarding User.id
}) {
  // cert2 DB table: public.users
  // unique: email, and authid unique
  const sql = `
    INSERT INTO public.users (email, name, authid, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      authid = EXCLUDED.authid,
      updated_at = NOW()
    RETURNING id;
  `;

  const res = await getCert2Pool().query(sql, [params.email, params.name, params.authId]);
  return res.rows[0]?.id as number | undefined;
}
