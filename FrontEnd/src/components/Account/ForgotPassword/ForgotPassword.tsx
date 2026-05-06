import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import PasswordInput from '../../UserControls/PasswordToggle/PasswordToggle';
import { Dropdown } from '../../UserControls/Dropdown/Dropdown';
import PasswordStrengthMeter from '../../UserControls/PasswordStrengthMeter/PasswordStrengthMeter'
import TextboxUnique from '../../UserControls/TextboxUnique/TextboxUnique';
import Loader from '../../UserControls/Loader/Loader';

import { checkEmail, checkUsername } from '../../UserControls/TextboxUnique/uniquevalidation';



function ForgotPassword() {
    const { setTitle, setBanner } = useOutletContext();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({} as any);
    const [requestSent, setRequestSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const API_BASE = getApiBaseUrl();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle('Forgot Password');
        setBanner('');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBanner('');

        const newErrors: any = {};

        if (!email.trim()) newErrors.email = 'Please enter an email';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        
        try {
            setIsSending(true);
            const response = await fetch(API_BASE + `/api/Users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Always success — backend never reveals email existence
                setBanner("Password reset request successful!");
                setRequestSent(true);
                setIsSending(false);
            } else {
                // Should only happen on BadRequest
                setBanner("Something went wrong. Please try again.");
                setIsSending(false);
            }
        } catch (err) {
            console.log ("ERR: " + err);
            setIsSending(false);
            //setBanner("Server error. Please try again.");
        }
    };


    const cardClass = isMobileTouchDevice() ? "mobile-card" : "narrow-card";

    if (requestSent) {
        return (
            <div className={`${cardClass} narrow-card content-holder-narrow`}
                style={{ height: '284px' }}
            >
                <div className="form-row" style={{ marginTop: '30px', textAlign: 'left' }}>
                    <h3>Password Reset Requested</h3>
                    <p style={{ marginTop: '20px' }}>
                        If an account exists with this email, a password reset link has been sent.
                        Please check your inbox — and your spam or junk folder just in case.
                        If you don’t see it after a few minutes, you can request another reset.
                    </p>
                </div>
            </div>
        );
    }

    if (isSending){
        return (
            <div className={`${cardClass} narrow-card content-holder-narrow`}
                style={{ height: '284px' }}
            >
                <div className="form-row" style={{ marginTop: '30px', textAlign: 'left' }}>
                    <Loader message="Sending password reset request..." />
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <main className={`${cardClass} narrow-card content-holder-narrow`}
                style={{ height: '284px' }}
            >



                {/* EMAIL */}

                <div className="form-row">
                    <label>Email</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <input
                            type="text"
                            className="form-control textbox textbox-text textbox-large"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="form-row"></div>


                {/* SUBMIT */}
                <div className="form-row d-flex justify-content-center align-items-center">
                    <button type="submit" className="button">Submit</button>
                </div>

            </main>
        </form>

    );
}

export default ForgotPassword;
