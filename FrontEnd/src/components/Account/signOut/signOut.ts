import { getApiBaseUrl } from '../../../helpers/config';

export default async function SignOut(): Promise<void> {
  const API_BASE = getApiBaseUrl(); // or hardcode if needed

  await fetch(`${API_BASE}/api/SignOut/signout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}
