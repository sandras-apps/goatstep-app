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
      return 'errors.weakPassword';
    case 'same_password':
      return 'errors.samePassword';
    case 'otp_expired':
      return 'errors.linkExpired';
    default:
      return error?.status === 429 ? 'errors.tooManyAttempts' : 'errors.generic';
  }
}
