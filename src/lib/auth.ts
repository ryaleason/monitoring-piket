import { getSettings } from "./db";

/**
 * Validates the x-admin-pin header on administrative mutation requests.
 */
export function validateAdminPin(request: Request): boolean {
  const pinHeader = request.headers.get("x-admin-pin");
  if (!pinHeader) return false;

  const settings = getSettings();
  const currentPin = settings.admin_pin || process.env.ADMIN_PIN || "1234";

  return pinHeader.trim() === currentPin.trim();
}
