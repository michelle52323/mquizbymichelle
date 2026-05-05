import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import type { LayoutContext } from '../../Layout';
import { Dropdown } from '../Dropdown/Dropdown';
import TextboxUnique from '../TextboxUnique/TextboxUnique';
import PasswordInput from '../../../components/UserControls/PasswordToggle/PasswordToggle';
import PasswordStrengthMeter from '../../UserControls/PasswordStrengthMeter/PasswordStrengthMeter'
import { checkEmailForProfile } from '../TextboxUnique/uniquevalidation';
import Loader from '../../UserControls/Loader/Loader'

import ButtonGrid from '../ButtonGrid/ButtonGrid';

const API_BASE = getApiBaseUrl();



interface ChangePasswordProps {
    forgotPassword?: boolean | null;   // defaults to false
    token?: string | null;             // only used when forgotPassword = true
    onSaveAndContinue: (model: ChangePasswordModel) => void;
    onCancel: () => void;
    isSaving: boolean;
    setIsSaving: (value: boolean) => void;
}

export interface ChangePasswordModel {
    currentPassword: string | null;    // required only when forgotPassword = false
    newPassword: string;
    confirmPassword: string;
}

interface ChangePasswordErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}


function ChangePassword({
    forgotPassword = false,
    token = null,
    onSaveAndContinue,
    onCancel,
    isSaving,
    setIsSaving
}: ChangePasswordProps) {

    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [verifyingPassword, setVerifyingPassword] = useState(false);

    const [model, setModel] = useState<ChangePasswordModel>({
        currentPassword: null,
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (isSaving || verifyingPassword) {

        }

    }, [isSaving, verifyingPassword]);


    const handleInternalSave = async () => {
        const newErrors: ChangePasswordErrors = {};

        // CURRENT PASSWORD (only when not forgotPassword)
        if (!forgotPassword) {
            if (!model.currentPassword || model.currentPassword.trim() === "") {
                newErrors.currentPassword = "Please enter your current password.";
            } else {
                if (!await verifyPassword()) {
                    newErrors.currentPassword = "Current password is incorrect.";
                }

                if (model.newPassword === model.currentPassword) {
                    newErrors.newPassword = "New password cannot be the same as your current password.";
                }
            }
        }

        // NEW PASSWORD
        if (!model.newPassword || model.newPassword.trim() === "") {
            newErrors.newPassword = "Please enter a new password.";
        }

        // CONFIRM PASSWORD
        if (!model.confirmPassword || model.confirmPassword.trim() === "") {
            newErrors.confirmPassword = "Please confirm your new password.";
        } else if (model.newPassword !== model.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        // Update UI errors
        setErrors(newErrors);

        // STOP if errors exist
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // No errors → call the PAGE handler
        onSaveAndContinue(model);
    };

    const verifyPassword = async () => {
        // 1. VERIFY CURRENT PASSWORD (only when not forgotPassword)
        setVerifyingPassword(true);
        if (model.currentPassword) {
            const verifyResponse = await fetch(`${API_BASE}/api/Users/verify-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // important for auth cookies
                body: JSON.stringify({
                    currentPassword: model.currentPassword
                })
            });

            const verifyResult = await verifyResponse.json();
            setVerifyingPassword(false);
            return verifyResult.success;
        }
    }


    return (
        <>
            <form id="page-form">
                <div className="content-holder-desktop">

                    <div className="content-inner-desktop">
                        <div className="page-container row pt-3">
                            {/* CURRENT PASSWORD — only when NOT forgotPassword */}
                            {!forgotPassword && (
                                <div className="form-row">
                                    <label>Current Password</label>
                                    <span className="required">*</span>
                                    <div className="form-element">
                                        <PasswordInput
                                            value={model.currentPassword ?? ""}
                                            onChange={(e) =>
                                                setModel({ ...model, currentPassword: e.target.value })
                                            }
                                            name="currentPassword"
                                        />
                                    </div>
                                    {errors.currentPassword && (
                                        <div className="error-message">{errors.currentPassword}</div>
                                    )}
                                </div>
                            )}

                            {/* NEW PASSWORD — always visible, includes strength meter */}
                            <div className="form-row strength-meter-row">
                                <label>New Password</label>
                                <span className="required">*</span>
                                <div className="form-element">
                                    <PasswordInput
                                        value={model.newPassword}
                                        onChange={(e) =>
                                            setModel({ ...model, newPassword: e.target.value })
                                        }
                                        name="newPassword"
                                    />
                                    <div style={{ height: "10px" }}></div>
                                    <PasswordStrengthMeter password={model.newPassword} />
                                </div>
                                {errors.newPassword && (
                                    <div className="error-message">{errors.newPassword}</div>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD — always visible, no strength meter */}
                            <div className="form-row">
                                <label>Confirm Password</label>
                                <span className="required">*</span>
                                <div className="form-element">
                                    <PasswordInput
                                        value={model.confirmPassword}
                                        onChange={(e) =>
                                            setModel({ ...model, confirmPassword: e.target.value })
                                        }
                                        name="confirmPassword"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <div className="error-message">{errors.confirmPassword}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>


            {/* BUTTON GRID */}
            <ButtonGrid
                buttons={[
                    // Desktop slots 1 & 2 are spacers
                    {
                        text: "Cancel",
                        onClick: onCancel,
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 3
                    },
                    {
                        text: (isSaving || verifyingPassword) ? (
                            <Loader message="Saving" buttonReplacement={true} />
                        ) : "Save & Continue",
                        onClick: handleInternalSave,
                        type: "button",
                        isDisabled: (isSaving || verifyingPassword),
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </>

    );
}

export default ChangePassword;
