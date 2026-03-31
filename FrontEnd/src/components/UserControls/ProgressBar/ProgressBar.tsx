import { useLocation } from "react-router-dom";
import './progress.css';

function ProgressBar() {
    const location = useLocation();
    const path = location.pathname.toLowerCase();

    const getClass = (keyword: string) => {
        const isMatch = path.includes(keyword.toLowerCase());
        return isMatch ? "progress-selected" : "progress-unselected";
    };

    return (
        <div className="quiz-progress-bar d-flex">
            <div className={`col-4 progress-panel ${getClass("/quizbuilder/quizinfo")}`}>
                1 | Basic Info
            </div>
            <div
                className={`col-4 progress-panel ${path.includes("/quizbuilder/questions/") ||
                        path.includes("/quizbuilder/questions/edit")
                        ? "progress-selected"
                        : "progress-unselected"
                    }`}
            >
                2 | Questions and Answers
            </div>
           <div className={`col-4 progress-panel ${getClass("/quizbuilder/review")}`}>
                3 | Review & Publish
            </div>
        </div>
    );
}

export default ProgressBar;