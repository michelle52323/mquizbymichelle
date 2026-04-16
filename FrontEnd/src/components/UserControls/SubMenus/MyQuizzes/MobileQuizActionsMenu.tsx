import React from 'react';
import Icon from '../../../UserControls/Icons/icons';
import '../../Menu/menu.css';

interface Quiz {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    subject: {
        id: number;
        description: string;
    };
    canTake: boolean;
}

interface Props {
    quiz: Quiz;
    navigate: (path: string) => void;
    openDeleteModal: () => void;
    closeMenu: () => void;
    isClosing: boolean;
}

const MobileQuizActionsMenu: React.FC<Props> = ({
    quiz,
    navigate,
    openDeleteModal,
    closeMenu,
    isClosing
}) => {

    //alert(JSON.stringify(quiz, null, 2));

    return (
        <div
            className={`mobile-bottom-sheet menu-background ${isClosing ? "closing" : "opening"}`}
            style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                paddingTop: '16px',
                paddingBottom: '16px',
                zIndex: 9999
            }}
        >

            <h4 className="menu-header" style={{ paddingLeft: '16px', paddingRight: '16px' }}>{quiz.name}</h4>
            <hr className="menu-divider" />
            <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                {/* Take Quiz */}
                {quiz.canTake && (
                    <div className="menu-item">
                        <button
                            className="menu-button-link"
                            onClick={() => {
                                navigate(`/quiz/${quiz.id}/intro`);
                                closeMenu();
                            }}
                        >
                            <div className="menu-icon">▶️</div>
                            <div className="menu-text">Take Quiz</div>
                        </button>
                    </div>
                )}

                {/* Edit Basic Info */}
                <div className="menu-item">
                    <button
                        className="menu-button-link"
                        onClick={() => {
                            navigate(`/QuizBuilder/QuizInfo/${quiz.id}`);
                            closeMenu();
                        }}
                    >
                        <div className="menu-icon">
                            <Icon name="pencil" />
                        </div>
                        <div className="menu-text">Edit Basic Info</div>
                    </button>
                </div>

                {/* Questions */}
                <div className="menu-item">
                    <button
                        className="menu-button-link"
                        onClick={() => {
                            navigate(`/QuizBuilder/Questions/${quiz.id}`);
                            closeMenu();
                        }}
                    >
                        <div className="menu-icon">❓</div>
                        <div className="menu-text">Questions</div>
                    </button>
                </div>

                {/* Review */}
                <div className="menu-item">
                    <button
                        className="menu-button-link"
                        onClick={() => {
                            navigate(`/QuizBuilder/Review/${quiz.id}`);
                            closeMenu();
                        }}
                    >
                        <div className="menu-icon">
                            <Icon name="review" />
                        </div>
                        <div className="menu-text">Review</div>
                    </button>
                </div>

                {/* Delete */}
                <div className="menu-item">
                    <button
                        className="menu-button-link"
                        onClick={() => {
                            openDeleteModal();
                            closeMenu();
                        }}
                    >
                        <div className="menu-icon">
                            <Icon name="delete" />
                        </div>
                        <div className="menu-text">Delete</div>
                    </button>
                </div>


            </div>





        </div>
    );
};

export default MobileQuizActionsMenu;
