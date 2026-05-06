import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation, useParams } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import type { LayoutContext } from '../../Layout';

import ChangePassword from '../../UserControls/ChangePassword/ChangePassword';
import { ChangePasswordModel } from '../../UserControls/ChangePassword/ChangePassword';
import Loader from '../../UserControls/Loader/Loader';

const API_BASE = getApiBaseUrl();

interface AuthResult {
    auth: boolean;
    claims: Record<string, string>;
}

function ResetPasswordPage() {

    const navigate = useNavigate();
    const location = useLocation();
    // -----------------------------
    // STATE
    // -----------------------------
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTitle('Reset Password');
    }, [setTitle]);

    const { token } = useParams();

    useEffect(() => {
        if (!token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);

    if (!token) {
        // Render nothing while redirecting
        return null;
    }

    useEffect(() => {
        const validateToken = async () => {
            setIsLoading(true);
            if (!token) {
                navigate("/dashboard");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/ResetPassword/validate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (!data.valid) {
                    navigate("/dashboard");
                    return;
                }
                if(data.valid){
                    setIsLoading(false);
                }
                // Token is valid → store userId
                setUserId(data.userId);

            } catch (err) {
                // On any error, treat as invalid
                navigate("/dashboard");
            }
        };

        validateToken();
    }, [token, navigate]);

    const handleSaveAndContinue = async (model: ChangePasswordModel) => {
        try {
            setIsSaving(true);
            const response = await fetch(`${API_BASE}/api/ResetPassword/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    userId: userId,
                    token: token,
                    newPassword: model.newPassword
                })
            });

            const data = await response.json();

            if (!data.success) {
                setIsSaving(false);
                setBanner(data.error || "Unable to save password.");
                return;
            }

            // SUCCESS
            if (data.success) {
                setIsSaving(false);
                setBanner("Password updated successfully!");
                navigate("/signin");
            }
        } catch (err) {
            setIsSaving(false);
            setBanner("An unexpected error occurred.");
        }
    };

    if(isLoading){
        return(
            <>
                <Loader message="Loading..." />
            </>
        );
    }

    return (
        <>
            <ChangePassword
                forgotPassword={true}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                onSaveAndContinue={handleSaveAndContinue} />

        </>
    );
}

export default ResetPasswordPage;
