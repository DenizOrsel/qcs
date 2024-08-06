import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";

const AnswersTable = ({ surveyId, interviewId }) => {
  const [groupedAnswers, setGroupedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surveyId && interviewId) {
      const fetchAnswers = async () => {
        try {
          const response = await axios.get(`/api/answers`, {
            params: { surveyId, interviewId },
          });

          const data = response.data;
          const grouped = data.reduce((acc, answer) => {
            if (!acc[answer.QuestionText]) {
              acc[answer.QuestionText] = [];
            }
            const values = [
              answer.AlphaValue,
              answer.NumericValue,
              answer.CategoryValueText,
            ].filter((value) => value !== null && value !== "NULL");

            if (values.length > 0) {
              acc[answer.QuestionText].push(values.join(", "));
            }
            return acc;
          }, {});

          setGroupedAnswers(grouped);
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
      <TableBody>
        {Object.keys(groupedAnswers).map((questionText, index) => (
          <React.Fragment key={index}>
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableCell colSpan={5} className="p-4">
                <section className="flex flex-col">
                  <div className="font-bold text-lg">{questionText}</div>
                  <div>{groupedAnswers[questionText].join(", ")}</div>
                </section>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default AnswersTable;
