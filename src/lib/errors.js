// Turns Supabase error codes into the key of a kind, human message in en.json / it.json.

export function authErrorKey(error) {
  switch (error?.code) {
    case 'invalid_credentials':
      return 'errors.invalidCredentials';
    case 'email_not_confirmed':
      return 'errors.emailNotConfirmed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'errors.tooManyAttempts';
    case 'weak_password':
      // Supabase still refused it (e.g. its rules changed). "pwned" = found in a known data leak.
      return error.reasons?.includes('pwned') ? 'errors.passwordLeaked' : 'errors.passwordRejected';
    case 'same_password':
      return 'errors.samePassword';
    case 'otp_expired':
      return 'errors.linkExpired';
    default:
      return error?.status === 429 ? 'errors.tooManyAttempts' : 'errors.generic';
  }
}
