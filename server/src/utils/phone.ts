// Canonical Egyptian mobile format used by accounts (users.phone) and orders.customer_phone.
export const PHONE_REGEX = /^01[0-9]{9}$/;

// Normalizes common Egyptian mobile formats ("010 1234 5678", "+201012345678", "201012345678")
// to the canonical "01XXXXXXXXX" form. Returns null for anything that can't be normalized.
export const normalizePhone = (raw: unknown): string | null => {
    if (typeof raw !== "string") {
        return null;
    }
    let phone = raw.replace(/[\s\-()]/g, "");
    if (phone.startsWith("+20")) {
        phone = phone.slice(3);
    } else if (phone.startsWith("20")) {
        phone = phone.slice(2);
    }
    // Local dialing drops the leading "0" ("01012345678" <-> "+201012345678").
    if (phone.startsWith("1") && phone.length === 10) {
        phone = `0${phone}`;
    }
    return PHONE_REGEX.test(phone) ? phone : null;
};