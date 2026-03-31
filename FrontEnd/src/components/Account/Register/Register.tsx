import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../helpers/config';
import PasswordInput from '../../../components/UserControls/PasswordToggle/PasswordToggle';
import { Dropdown } from '../../../components/UserControls/Dropdown/Dropdown';
import PasswordStrengthMeter from '../../UserControls/PasswordStrengthMeter/PasswordStrengthMeter'
import TextboxUnique from '../../UserControls/TextboxUnique/TextboxUnique';

import { checkEmail, checkUsername } from '../../UserControls/TextboxUnique/uniquevalidation';
import '../../../radio.css';

export interface Gender {
    id: number;
    description: string;
    code: string;
}


function Register() {
    const { setTitle, setBanner } = useOutletContext();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [genderId, setGenderId] = useState('');
    const [accountType, setAccountType] = useState('');
    const [genderOptions, setGenderOptions] = useState([]);
    const [errors, setErrors] = useState({} as any);

    const API_BASE = getApiBaseUrl();
    const navigate = useNavigate();


    const [usernameStatus, setUsernameStatus] = useState<'none' | 'available' | 'taken'>('none');
    const [emailStatus, setEmailStatus] = useState<'none' | 'available' | 'taken'>('none');

    const handleUsernameBlur = async () => {
        const newErrors = errors;
        if (!username) {
            setUsernameStatus('none');
            newErrors.username = "";
            setErrors(newErrors);
            return;
        }

        const available = await checkUsername(username);
        setUsernameStatus(available ? 'available' : 'taken');
        
        if (!available)
            newErrors.username = "Username taken. Please enter another username.";
        else
            newErrors.username = "";
        setErrors(newErrors);
    };


    const handleEmailBlur = async () => {
        const newErrors = errors;
        if (!email) {
            setEmailStatus('none');
            newErrors.email = "";
            setErrors(newErrors);
            return;
        }

        const available = await checkEmail(email);
        setEmailStatus(available ? 'available' : 'taken');
        
        if (!available)
            newErrors.email = "Email taken. Please enter another email.";
        else
            newErrors.email = "";
        setErrors(newErrors);
    };


    useEffect(() => {
        setTitle('Register');
        setBanner('');
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBanner('');

        const newErrors: any = {};

        if(usernameStatus=="taken") newErrors.username = "Username taken. Please enter another username.";
        if(emailStatus=="taken") newErrors.email = "Email taken. Please enter another email.";
        if (!username.trim()) newErrors.username = 'Please enter a username';
        if (!email.trim()) newErrors.email = 'Please enter an email';
        if (!firstName.trim()) newErrors.firstName = 'Please enter a first name';
        //if (!lastName.trim()) newErrors.lastName = 'Please enter a last name';
        if (!password.trim()) newErrors.password = 'Please enter a password';
        if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm password';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords must match';
        //if (!genderId) newErrors.gender = 'Please select a gender';
        if (!accountType) newErrors.accountType = 'Please select an account type';


        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        (async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Users/register`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password,
                        email,
                        firstName,
                        themeId: 1,
                        userTypeId: getUserTypeId()
                    })

                });

                const data = await response.json();

                if (data.success) {
                    setBanner('Registration successful! You may now sign in.');
                    navigate('/signin');
                } else {
                    setBanner(data.message || 'Registration failed');
                }
            } catch (err) {
                console.error('Registration error:', err);
                setBanner('Something went wrong');
            }
        })();
    };

    const getUserTypeId = () => {
        if (accountType === "Instructor")
            return 3;
        else if (accountType === "Student")
            return 4;
    }

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

    const cardClass = isMobileTouchDevice() ? "mobile-card" : "narrow-card";

    return (
        <form onSubmit={handleSubmit}>
            <main className={`${cardClass} narrow-card content-holder-narrow`}>

                {/* USERNAME */}
                <div className="form-row">
                    <label>Username</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <TextboxUnique
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onBlur={handleUsernameBlur}
                            status={usernameStatus}
                        />
                    </div>
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                {/* EMAIL */}
                <div className="form-row">
                    <label>Email</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <TextboxUnique
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={handleEmailBlur}
                            status={emailStatus}
                        />

                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                {/* FIRST NAME */}
                <div className="form-row">
                    <label>First Name</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <input
                            type="text"
                            className="form-control textbox textbox-text textbox-large"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>

                {/* MIDDLE NAME */}
                {/* <div className="form-row">
                    <label>Middle Name</label>
                    <div className="form-element">
                        <input
                            type="text"
                            className="form-control textbox textbox-text textbox-large"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                        />
                    </div>
                </div> */}

                {/* LAST NAME */}
                {/* <div className="form-row">
                    <label>Last Name</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <input
                            type="text"
                            className="form-control textbox textbox-text textbox-large"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div> */}

                {/* GENDER DROPDOWN */}
                {/* <div className="form-row">
                    <label>Gender</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <Dropdown
                            options={genderOptions}
                            selectedId={genderId}
                            onSelect={(id) => setGenderId(id)}
                        />
                    </div>
                    {errors.gender && <div className="error-message">{errors.gender}</div>}
                </div> */}

                {/* PASSWORD */}
                <div className="form-row strength-meter-row">
                    <label>Password</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            name="password"
                        />
                        <div style={{ height: "10px" }}></div>
                        <PasswordStrengthMeter password={password} />
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="form-row">
                    <label>Confirm Password</label>
                    <span className="required">*</span>
                    <div className="form-element">
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            name="confirmPassword"
                        />
                    </div>
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>

                {/* ACCOUNT TYPE RADIO */}
                <div className="form-row">
                    <label>Account Type</label>
                    <span className="required">*</span>

                    <div className="radio-holder-vertical">
                        <ul>
                            <li>
                                <input
                                    type="radio"
                                    id="acct-student"
                                    name="accountType"
                                    value="Student"
                                    checked={accountType === 'Student'}
                                    onChange={() => setAccountType('Student')}
                                />
                                <div className="check"></div>
                                <label htmlFor="acct-student">Student</label>
                            </li>

                            <li>
                                <input
                                    type="radio"
                                    id="acct-instructor"
                                    name="accountType"
                                    value="Instructor"
                                    checked={accountType === 'Instructor'}
                                    onChange={() => setAccountType('Instructor')}
                                />
                                <div className="check"></div>
                                <label htmlFor="acct-instructor">Instructor</label>
                            </li>
                        </ul>
                    </div>

                    {errors.accountType && <div className="error-message">{errors.accountType}</div>}
                </div>

                {/* SUBMIT */}
                <div className="form-row d-flex justify-content-center align-items-center">
                    <button type="submit" className="button">Register</button>
                </div>

            </main>
        </form>
    );
}

export default Register;
