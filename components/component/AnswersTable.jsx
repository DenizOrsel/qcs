import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import axios from "axios";

const AnswersTable = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surveyId) {
      const fetchAnswers = async () => {
        try {
          const response = await axios.get(`/api/answers?surveyId=${surveyId}`);
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
  }, [surveyId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Survey Answers</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>InterviewId</TableHead>
              <TableHead>QuestionId</TableHead>
              <TableHead>QuestionText</TableHead>
              <TableHead>AlphaValue</TableHead>
              <TableHead>NumericValue</TableHead>
              <TableHead>CategoryValueId</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answers.map((answer) => (
              <TableRow key={answer.Id}>
                <TableCell>{answer.Id}</TableCell>
                <TableCell>{answer.InterviewId}</TableCell>
                <TableCell>{answer.QuestionId}</TableCell>
                <TableCell>{answer.QuestionText}</TableCell>
                <TableCell>{answer.AlphaValue || "NULL"}</TableCell>
                <TableCell>{answer.NumericValue || "NULL"}</TableCell>
                <TableCell>{answer.CategoryValueId || "NULL"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnswersTable;
