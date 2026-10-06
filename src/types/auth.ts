export type FieldErrors = Partial<Record<"name" | "email" | "password" | "phone_number", string>>;

export const TOKEN_KEY = "betamindToken";
export const REFRESH_KEY = "betamindRefresh";

/**
 * Takes the mutation's onSuccess argument and stores the JWT pair.
 * Handles the shapes your Google flow reads (data.tokens) plus a couple of
 * common variants. Returns true if an access token was found and saved.
 */
export const saveTokens = (res: any): boolean => {
  const tokens =
    res?.data?.tokens ??
    res?.data?.data?.tokens ??
    res?.tokens ??
    (res?.data?.access ? res.data : undefined);

  if (!tokens?.access) return false;

  localStorage.setItem(TOKEN_KEY, tokens.access);
  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
  return true;
};

const first = (v: unknown) => (Array.isArray(v) ? String(v[0]) : String(v));

/**
 * Normalises DRF errors:
 *  { message } | { detail } | { non_field_errors: [] } |
 *  { email: ["user with this email already exists."] } | { errors: { email: [] } }
 */
export const parseApiError = (e: any) => {
  const data = e?.response?.data;
  const fieldErrors: FieldErrors = {};
  let message: string | undefined;

  if (data && typeof data === "object") {
    message = data.message || data.detail;
    if (!message && data.non_field_errors) message = first(data.non_field_errors);

    for (const key of ["name", "email", "password", "phone_number"] as const) {
      const v = data[key] ?? data?.errors?.[key];
      if (v) fieldErrors[key] = first(v);
    }
  }

  return {
    fieldErrors,
    message:
      (typeof message === "string" && message) ||
      Object.values(fieldErrors)[0] ||
      "Something went wrong. Please try again.",
  };
};