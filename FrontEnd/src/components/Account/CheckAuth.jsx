import { getApiBaseUrl, isDevUseMockLogin, isMobileTouchDeviceDev, isMobileTouchDevice } from '../../helpers/config';

export default async function CheckAuth() {
    //console.log("CheckAuth invoked");

    const API_BASE = getApiBaseUrl();

    try {
        const url = isDevUseMockLogin()
            ? `${getApiBaseUrl()}/api/mock/claims`
            : `${getApiBaseUrl()}/api/CheckAuthorization/check-auth`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        //alert(isDevUseMockLogin())
        if (response.status === 401 || !response.ok) {
            return { auth: false };
        }

        const data = await response.json();

        if (!data.authenticated) {
            return { auth: false };
        }

        return {
            auth: true,
            username: data.username,
            claims: data.claims,
        };
    } catch (error) {
        console.error('Auth check failed:', error);
        return { auth: false };
    }
}