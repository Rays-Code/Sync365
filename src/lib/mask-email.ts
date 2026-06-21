/**
 * Masks an email address for display purposes.
 * Shows first 3 and last 1 chars of local part.
 * Example: "olivia@example.com" ? "oli***a@example.com"
 * Example: "jo@example.com" ? "j***o@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '***@***.***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  const first = local.slice(0, Math.min(3, local.length - 1));
  const last = local.charAt(local.length - 1);
  return `${first}***${last}@${domain}`;
}
