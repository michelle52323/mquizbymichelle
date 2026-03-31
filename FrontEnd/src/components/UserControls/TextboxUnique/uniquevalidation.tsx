import { getApiBaseUrl } from '../../../helpers/config';

export interface AvailabilityResponse {
    available: boolean;
}

export async function checkEmail(email: string): Promise<boolean> {
    const API_BASE = getApiBaseUrl();
    const res = await fetch(`${API_BASE}/api/users/check-email?email=${encodeURIComponent(email)}`);
    const data: AvailabilityResponse = await res.json();
    return data.available;
}

export async function checkUsername(username: string): Promise<boolean> {
    const API_BASE = getApiBaseUrl();
    const res = await fetch(`${API_BASE}/api/users/check-username?username=${encodeURIComponent(username)}`);
    const data: AvailabilityResponse = await res.json();
    return data.available;
}

export async function checkEmailForProfile(email: string): Promise<boolean> {
    const API_BASE = getApiBaseUrl();
    const res = await fetch(`${API_BASE}/api/users/check-email-profile?email=${email}`, {
        method: "GET",
        credentials: "include"
    });
    const data: AvailabilityResponse = await res.json();
    return data.available;
}
