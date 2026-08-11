/**
 * Landing screen – intentionally renders nothing.
 *
 * All initial routing (auth vs. onboarding vs. home) is handled by
 * AppBootstrap after it finishes restoring the session from secure storage.
 * Keeping this screen blank prevents a race where index.tsx would redirect
 * to an auth route before tokens had been loaded.
 */
export default function IndexScreen() {
  return null;
}
