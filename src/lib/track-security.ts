export async function trackFailedLogin(email: string, pagePath: string) {
  // Security tracking disabled as the backend system has been removed.
  console.log('Security tracking disabled:', { email, pagePath });
}
