import { useParams } from "react-router-dom";
import { Edit } from "../Edit/Edit"; // adjust path as needed

export default function AddPage() {
  const { quizId } = useParams();

  return (
    <Edit mode="add" quizId={quizId} />
  );
}