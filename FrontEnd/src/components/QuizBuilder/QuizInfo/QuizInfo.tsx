import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { getApiBaseUrl } from '../../../helpers/config';
import CheckAuth from '../../../components/Account/CheckAuth';
import { Dropdown } from '../../UserControls/Dropdown/Dropdown';
import type { LayoutContext } from '../../Layout';
import Icon from '../../UserControls/Icons/icons';
import ButtonGrid from '../../UserControls/ButtonGrid/ButtonGrid';
import ProgressBar from '../../UserControls/ProgressBar/ProgressBar';

const API_BASE = getApiBaseUrl();

interface QuizForm {
    name: string;
    description: string;
    subjectId: string;
}

interface QuizValidationErrors {
    quiz?: {
        name?: string;
        description?: string;
        subjectId?: string;
    };
}

interface Claims {
    FirstName?: string;
    UserId?: string;
    [key: string]: string | undefined;
}

interface AuthResult {
    auth: boolean;
    username?: string;
    claims?: Claims;
}

interface Subject {
    id: number;
    desc: string;
}

const QuizInfo: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;

    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const location = useLocation();

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

    

    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [quiz, setQuiz] = useState<QuizForm>({
        name: '',
        description: '',
        subjectId: '',
    });
    const [errors, setErrors] = useState<{ quiz: Partial<Record<keyof QuizForm, string>> }>({ quiz: {} });
    const [selectedCategory, setSelectedCategory] = useState<{ id: string; text: string } | null>(null);

    const categoryList = useMemo(() => {
        return subjects.map(s => ({ id: s.id.toString(), text: s.desc }));
    }, [subjects]);

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


    }, [auth, isEditMode, navigate]);

    useEffect(() => {
        fetch(`${API_BASE}/api/Subjects/dropdown`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch subjects'))
            .then((data: Subject[]) => setSubjects(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!id || subjects.length === 0 || !auth?.claims?.UserId) return;

        fetch(`${API_BASE}/api/QuizInfo/${id}`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Quiz not found'))
            .then(data => {
                if (data.userId !== auth.claims?.UserId) {
                    console.warn('Unauthorized access attempt');
                    navigate('/dashboard');
                    return;
                }

                const hydratedQuiz: QuizForm = {
                    name: data.name,
                    description: data.description,
                    subjectId: data.subjectId?.toString() || '',
                };

                setQuiz(hydratedQuiz);

                const matchedCategory = categoryList.find(cat => cat.id === hydratedQuiz.subjectId);
                if (matchedCategory) {
                    setSelectedCategory(matchedCategory);
                }
            })
            .catch(err => {
                console.error(err);
                navigate('/dashboard');
            });
    }, [id, subjects, auth?.claims?.UserId, categoryList, navigate]);

    //Set title
    useEffect(() => {
        if (isEditMode) {
            setTitle(`${quiz.name}`);
        } else {
            setTitle('Create New Quiz');
        }
    }, [isEditMode, quiz.name, setTitle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setQuiz(prev => ({ ...prev, [name]: value }));
    };

    const CreateQuiz = async (
        formData: QuizForm,
        setErrors: React.Dispatch<React.SetStateAction<{ quiz: Partial<Record<keyof QuizForm, string>> }>>
    ): Promise<number | null> => {
        const newErrors: Partial<Record<keyof QuizForm, string>> = {};
        if (!formData.name?.trim()) newErrors.name = "Quiz name is required.";
        if (!formData.description?.trim()) newErrors.description = "Description is required.";
        if (!formData.subjectId?.toString().trim()) newErrors.subjectId = "Subject is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors({ quiz: newErrors });
            return null;
        }

        setErrors({ quiz: {} });

        try {
            const dto = { Name: formData.name, Description: formData.description, SubjectId: formData.subjectId };
            const response = await axios.post(`${API_BASE}/api/QuizInfo/create-quiz`, dto, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            return response.data.success ? response.data.quizId : null;
        } catch (error) {
            console.error("Exception during quiz creation:", error);
            return null;
        }
    };

    const UpdateQuiz = async (
        formData: QuizForm,
        id: string,
        setErrors: React.Dispatch<React.SetStateAction<{ quiz: Partial<Record<keyof QuizForm, string>> }>>
    ): Promise<boolean> => {

        const newErrors: Partial<Record<keyof QuizForm, string>> = {};

        // Same validation as CreateQuiz
        if (!formData.name?.trim()) newErrors.name = "Quiz name is required.";
        if (!formData.description?.trim()) newErrors.description = "Description is required.";
        if (!formData.subjectId?.toString().trim()) newErrors.subjectId = "Subject is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors({ quiz: newErrors });
            return false;
        }

        setErrors({ quiz: {} });

        try {
            const dto = {
                Id: Number(id),
                Name: formData.name,
                Description: formData.description,
                SubjectId: formData.subjectId,
            };

            const response = await axios.put(
                `${API_BASE}/api/QuizInfo/update-quiz/${id}`,
                dto,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            return response.data.success === true;
        } catch (error) {
            console.error("Exception during quiz update:", error);
            return false;
        }
    };

    const handleSave = async () => {
        setBanner('');
        const result = isEditMode
            ? await UpdateQuiz(quiz, id, setErrors)
            : await CreateQuiz(quiz, setErrors);


        if (typeof result === "number") {
            // navigate to the newly created quiz
            if (result) {
                navigate(`/QuizBuilder/QuizInfo/${result}`, {
                    state: { banner: "Quiz created successfully!" },
                });
            }
        }
        else if (typeof result === "boolean") {
            // navigate back to the same quiz using the existing id
            if (result) {
                navigate(`/QuizBuilder/QuizInfo/${id}`, {
                    state: { banner: "Quiz updated successfully!" },
                });
            }
        }



    };

    const handleSaveAndContinue = async () => {
        setBanner('');
        const result = isEditMode
            ? await UpdateQuiz(quiz, id, setErrors)
            : await CreateQuiz(quiz, setErrors);

        if (typeof result === "number") {
            // navigate to the newly created quiz
            if (result) {
                navigate(`/QuizBuilder/Questions/${result}`, {
                    state: { banner: "Quiz created successfully!" },
                });
            }
        }
        else if (typeof result === "boolean") {
            // navigate back to the same quiz using the existing id
            if (result) {
                navigate(`/QuizBuilder/Questions/${id}`, {
                    state: { banner: "Quiz updated successfully!" },
                });
            }
        }
    };

    if (auth === null) return <div>Loading dashboard...</div>;
    if (!auth.auth) return null;

    const isDropdownReady = categoryList.length > 0 && quiz.subjectId !== '';

    return (
        <>

            <form id="page-form">
                <div className="content-holder-desktop" >
                    <ProgressBar />
                    <div className="content-inner-desktop">
                        <div className="page-container row pt-3">
                            <div className="page-item col-12 col-md-6">
                                <label className='form-label-tight'>Quiz Name</label>
                                <span className="required">*</span>
                                <br />
                                <div className="form-element">
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control textbox textbox-text textbox-large"
                                        value={quiz.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.quiz?.name ? (
                                    <div className="error-message">{errors.quiz.name}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>
                            <div className="page-item col-12 col-md-6">
                                <label className='form-label-tight'>Description</label>
                                <span className="required">*</span>
                                <br />
                                <div className="form-element">
                                    <textarea
                                        className="form-control textarea textbox-large textarea-text"
                                        name="description"
                                        maxLength={500}
                                        value={quiz.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>
                                {errors.quiz?.description ? (
                                    <div className="error-message">{errors.quiz.description}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>
                            <div className="page-item col-12 col-md-6 d-flex flex-column">
                                <div>
                                    <label className='form-label-tight'>Subject</label>
                                    <span className="required">*</span>
                                    <br />
                                </div>
                                <Dropdown
                                    options={categoryList}
                                    selectedId={quiz.subjectId}
                                    onSelect={(id, text) => {
                                        setSelectedCategory({ id, text });
                                        setQuiz(prev => ({ ...prev, subjectId: id }));
                                    }}
                                    width={250}

                                />
                                {errors.quiz?.subjectId ? (
                                    <div className="error-message">{errors.quiz.subjectId}</div>
                                ) : (
                                    <div className="error-message-placeholder-height"></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* BUTTON SLOT FEATURE */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Cancel",
                        url: "/quizbuilder/myquizzes",
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 3
                    },
                    {
                        text: "Save",
                        onClick: handleSave,
                        type: "button",
                        value: "Save",
                        mobileSlot: 2,
                        desktopSlot: 4
                    },
                    {
                        text: "Next",
                        onClick: handleSaveAndContinue,
                        type: "button",
                        value: "SaveContinue",
                        icon: <Icon name="rightArrow" />,
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </>
    );
};

export default QuizInfo;