import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import type { LayoutContext } from '../../Layout';
import { Dropdown } from '../../../components/UserControls/Dropdown/Dropdown';
import TextboxUnique from '../../UserControls/TextboxUnique/TextboxUnique';
import { checkEmailForProfile } from '../../UserControls/TextboxUnique/uniquevalidation';
import CheckAuth from '../../../components/Account/CheckAuth';

import ButtonGrid from '../../../components/UserControls/ButtonGrid/ButtonGrid';

const API_BASE = getApiBaseUrl();

interface AuthResult {
    auth: boolean;
    claims: Record<string, string>;
}

export interface ProfileForm {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    pronouns: string;
    genderId: number; // required, stored as int
}

export interface ProfileValidationErrors {
    profile?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        email?: string;
        pronouns?: string;
        genderId?: string;
    };
}

export interface UserProfileDto {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    email: string;
    pronouns: string | null;
    genderId: number | null;
}




const Profile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // -----------------------------
    // STATE
    // -----------------------------
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState<AuthResult | null>(null);



    // const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<'none' | 'available' | 'taken'>('none');

    // const [genderId, setGenderId] = useState<number | null>(null);
    const [genderOptions, setGenderOptions] = useState<any[]>([]); // will populate later with API

    const [profileValidationErrors, setProfileValidationErrors] = useState<ProfileValidationErrors>({
        profile: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            pronouns: '',
            genderId: ''
        }
    });



    const [profile, setProfile] = useState<ProfileForm>({
        id: 0,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        pronouns: "",
        genderId: 0
    });


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        setTitle('Profile');
    }, [setTitle]);

    // -----------------------------
    // EMAIL BLUR HANDLER
    // -----------------------------
    const handleEmailBlur = async () => {
        const email = profile.email.trim();

        if (!email) {
            setEmailStatus('none');
            setProfileValidationErrors(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    email: 'Email is required.'
                }
            }));
            return;
        }

        //setEmailStatus('checking');

        const result = await checkEmailForProfile(email);

        if (result) {
            // available
            setEmailStatus('available');
            setProfileValidationErrors(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    email: ''
                }
            }));
        } else {
            // taken
            setEmailStatus('taken');
            setProfileValidationErrors(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    email: 'Email taken. Please enter another email.'
                }
            }));
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

    // -----------------------------
    // BUTTON HANDLERS (no API yet)
    // -----------------------------
    const handleCancel = () => {
        setBanner('');
        navigate('/dashboard');
    };

    const performSave = async (isContinue: boolean) => {
        // validation placeholder
        const newErrors: any = {};

        // First name
        newErrors.firstName = profile.firstName.trim()
            ? ''
            : 'Please enter a first name.';

        // Email
        newErrors.email = profile.email.trim()
            ? ''
            : 'Please enter an email.';

        // Now update the nested state
        setProfileValidationErrors(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                ...newErrors
            }
        }));





        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(x => x !== '');

        if (hasErrors) return false;


        // API call will go here later
        const dto: UserProfileDto = {
            id: profile.id, // temporary until you tell me how to handle it
            firstName: profile.firstName,
            middleName: profile.middleName || null,
            lastName: profile.lastName || null,
            email: profile.email,
            pronouns: profile.pronouns || null,
            genderId: profile.genderId ?? null
        };

        const response = await fetch(`${API_BASE}/api/Users/UpdateUserProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(dto)
        });

        const data = await response.json();

        if (data.success) {


            return true;
        } else {
            //setBanner('Error updating user profile.');
            return false;
        }


    };

    const handleSave = async () => {
        setBanner('');
        var result = await performSave(false);

        if (result) {
            setBanner('User profile updated successfully!');
        }
    }

    const handleSaveAndContinue = async () => {
        setBanner('');
        var result = await performSave(true);

        if (result) {
            navigate(`/dashboard`, {
                state: { banner: "User profile updated successfully!" },
            });


        }

    };

    useEffect(() => {

        return () => {

            setBanner('');
        };
    }, []);

    useEffect(() => {
        if (location.state?.banner) {
            setBanner(location.state.banner);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state?.banner, setBanner, navigate, location.pathname]);

    // -----------------------------
    // INITIAL LOAD 
    // -----------------------------
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Users/GetUserProfile`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.error || "Failed to load profile.");
                    setLoading(false);
                    return;
                }

                // Populate ProfileForm
                setProfile({
                    id: data.user.id,
                    firstName: data.user.firstName || "",
                    middleName: data.user.middleName || "",
                    lastName: data.user.lastName || "",
                    email: data.user.email || "",
                    pronouns: data.user.pronouns || "",
                    genderId: data.user.genderId
                });

                // Immediately check email status on load
                if (data.user.email) {

                    const result = await checkEmailForProfile(data.user.email);
                    setEmailStatus(result ? 'available' : 'taken');
                }


                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Unexpected error.");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [API_BASE]);

    // -----------------------------
    // Populate Genders Dropdown
    // -----------------------------

    useEffect(() => {

        (async () => {
            const response = await fetch(`${API_BASE}/api/genders`);
            const data = await response.json();
            setGenderOptions(data.map(g => ({
                id: g.id,
                text: g.description
            })));
        })();
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;


    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <>
            <form id="page-form">
                <div className="content-holder-desktop">

                    <div className="content-inner-desktop">
                        <div className="page-container row pt-3">

                            {/* LEFT COLUMN */}
                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">First Name</label>
                                <span className="required">*</span>
                                <div className="form-element">
                                    <input
                                        type="text"
                                        className="form-control textbox textbox-large textbox-text"
                                        value={profile.firstName}
                                        onChange={e => setProfile(prev => ({ ...prev, firstName: e.target.value }))}

                                    />
                                </div>
                                {profileValidationErrors.profile.firstName ? (
                                    <div className="error-message">{profileValidationErrors.profile.firstName}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>

                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Middle Name</label>
                                <div className="form-element">
                                    <input
                                        type="text"
                                        className="form-control textbox textbox-large textbox-text"
                                        value={profile.middleName}
                                        onChange={e => setProfile(prev => ({ ...prev, middleName: e.target.value }))}

                                    />
                                </div>
                                <div className="error-message-placeholder-height"></div>
                            </div>

                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Last Name</label>
                                <div className="form-element">
                                    <input
                                        type="text"
                                        className="form-control textbox textbox-large textbox-text"
                                        value={profile.lastName}
                                        onChange={e => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                    />
                                </div>
                                {profileValidationErrors.profile.lastName ? (
                                    <div className="error-message">{profileValidationErrors.profile.lastName}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>

                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Email</label>
                                <span className="required">*</span>
                                <div className="form-element">
                                    <TextboxUnique
                                        value={profile.email}
                                        onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        onBlur={handleEmailBlur}
                                        status={emailStatus}
                                    />
                                </div>
                                {profileValidationErrors.profile.email ? (
                                    <div className="error-message">{profileValidationErrors.profile.email}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>

                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Pronouns</label>
                                <div className="form-element">
                                    <input
                                        type="text"
                                        className="form-control textbox textbox-large textbox-text"
                                        value={profile.pronouns}
                                        onChange={e => setProfile(prev => ({ ...prev, pronouns: e.target.value }))}
                                    />
                                </div>
                                <div className="error-message-placeholder-height"></div>
                            </div>

                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Gender</label>
                                <div className="form-element">
                                    <Dropdown
                                        options={genderOptions}
                                        selectedId={profile.genderId}
                                        onSelect={(id) =>
                                            setProfile(prev => ({
                                                ...prev,
                                                genderId: id
                                            }))
                                        }

                                    />
                                </div>
                                {profileValidationErrors.profile.genderId ? (
                                    <div className="error-message">{profileValidationErrors.profile.genderId}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
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
                        onClick: handleCancel,
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 3
                    },
                    {
                        text: "Save",
                        onClick: handleSave,
                        type: "button",
                        mobileSlot: 2,
                        desktopSlot: 4
                    },
                    {
                        text: "Save & Continue",
                        onClick: handleSaveAndContinue,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </>
    );
};

export default Profile;
