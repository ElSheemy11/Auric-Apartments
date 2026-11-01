/** Consistent result shape for every server action: { ok, data } | { ok, error }.
 * Error codes map to message keys (never hardcoded UI text). */
export type ActionError = { code: string; messageKey: string };
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export function success<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function failure(code: string, messageKey: string): ActionResult<never> {
  return { ok: false, error: { code, messageKey } };
}

export function fromUnknown(error: unknown): ActionError {
  if (error instanceof Error) {
    if (error.message === "user is suspended")
      return { code: "suspended", messageKey: "errors.suspended" };
    if (error.message === "admin required" || error.message === "forbidden")
      return { code: "forbidden", messageKey: "errors.forbidden" };
    if (error.message === "not found") return { code: "not_found", messageKey: "errors.notFound" };
  }
  return { code: "unknown", messageKey: "errors.unknown" };
}