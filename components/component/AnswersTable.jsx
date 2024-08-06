import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const AnswersTable = ({ surveyId, interviewId }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surveyId && interviewId) {
      const fetchAnswers = async () => {
        try {
          const response = await axios.get(`/api/answers`, {
            params: { surveyId, interviewId },
          });
          setAnswers(response.data);
        } catch (error) {
          console.error("Error fetching answers:", error);
          setError("Error fetching answers");
        } finally {
          setLoading(false);
        }
      };

      fetchAnswers();
    }
  }, [surveyId, interviewId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>InterviewId</TableHead>
          <TableHead>QuestionText</TableHead>
          <TableHead>AlphaValue</TableHead>
          <TableHead>NumericValue</TableHead>
          <TableHead>CategoryValueId</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {answers.map((answer) => (
          <TableRow key={answer.AnswerId}>
            <TableCell>{answer.NfieldInterviewId}</TableCell>
            <TableCell>{answer.QuestionText}</TableCell>
            <TableCell>{answer.AlphaValue || "NULL"}</TableCell>
            <TableCell>{answer.NumericValue || "NULL"}</TableCell>
            <TableCell>{answer.CategoryValueId || "NULL"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AnswersTable;
