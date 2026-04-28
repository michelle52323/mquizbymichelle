import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckAuth from '../../components/Account/CheckAuth';

function LoadCheckAuth() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
        }
        hydrateAuth();
    }, []);

    useEffect(() => {
        if (auth === null) return;

        if (!auth.auth) {
            navigate("/signin");
        } else {
            navigate("/dashboard");
        }
    }, [auth, navigate]);

    return <div>Checking authentication...</div>;
}

export default LoadCheckAuth;