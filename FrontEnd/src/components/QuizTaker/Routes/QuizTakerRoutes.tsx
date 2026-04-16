import { Routes, Route } from "react-router-dom";
import Intro from "../Intro/Intro";
import Questions from "../Questions/Questions";
import Review from "../Review/Review";
import Score from "../Score/Score";

export default function QuizTakerRoutes() {
    return (
        <Routes>
            <Route path="intro" element={<Intro />} />
            <Route path="questions" element={<Questions />} />
            <Route path="questions/:questionId" element={<Questions />} />
            <Route path="review" element={<Review />} />
            <Route path="score" element={<Score />} />
        </Routes>
    );
}
