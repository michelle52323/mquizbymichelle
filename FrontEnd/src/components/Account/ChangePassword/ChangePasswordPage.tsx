import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import type { LayoutContext } from '../../Layout';
import { Dropdown } from '../../UserControls/Dropdown/Dropdown';
import TextboxUnique from '../../UserControls/TextboxUnique/TextboxUnique';
import { checkEmailForProfile } from '../../UserControls/TextboxUnique/uniquevalidation';
import CheckAuth from '../CheckAuth';
import ChangePassword from '../../UserControls/ChangePassword/ChangePassword';
import { ChangePasswordModel } from '../../UserControls/ChangePassword/ChangePassword';

import ButtonGrid from '../../UserControls/ButtonGrid/ButtonGrid';

const API_BASE = getApiBaseUrl();

interface AuthResult {
    auth: boolean;
    claims: Record<string, string>;
}

function ChangePasswordPage() {

    const navigate = useNavigate();
    const location = useLocation();
    // -----------------------------
    // STATE
    // -----------------------------
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle('Change Password');
    }, [setTitle]);

    const handleCancel = () => {
        navigate('/dashboard');
    };

    const handleSaveAndContinue = async (model: ChangePasswordModel) => {
        try {
            setIsSaving(true);
            const response = await fetch(`${API_BASE}/api/Users/save-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
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
            setBanner("Password updated successfully!");
            navigate("/dashboard");
        } catch (err) {
            setIsSaving(false);
            setBanner("An unexpected error occurred.");
        }
    };


    // -----------------------------
    // CHECK AUTH (redirect to sign in if not authenticated)
    // -----------------------------

    useEffect(() => {
        CheckAuth().then(setAuth);
    }, []);

    useEffect(() => {
        if (!auth) return;

        if (!auth.auth) {
            navigate('/signin');
            return;
        }

        const role = auth.claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role !== 'Instructor') {
            navigate('/dashboard');
            return;
        }


    }, [auth, navigate]);

    return (
        <>
            <ChangePassword
                forgotPassword={false}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                onSaveAndContinue={handleSaveAndContinue}
                onCancel={handleCancel} />

        </>
    );
}

export default ChangePasswordPage;
