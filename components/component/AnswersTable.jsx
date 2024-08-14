import { useEffect, useState, useMemo } from "react";
import React from "react";
import axios from "axios";
import Error from "@/components/component/Error";
import { Input } from "@/components/ui/input";
import { UpdateIcon } from "@radix-ui/react-icons";

const AnswersTable = ({
  surveyId,
  interviewId,
  renderAnswerWithImages,
  onLoaded,
}) => {
  const [groupedAnswers, setGroupedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

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
          onLoaded();
        }
      };

      fetchAnswers();
    }
  }, [surveyId, interviewId, onLoaded]);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredQuestions = useMemo(() => {
    const searchValue = search.toLowerCase();
    return Object.keys(groupedAnswers).filter((questionText) =>
      questionText.toLowerCase().includes(searchValue)
    );
  }, [search, groupedAnswers]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <UpdateIcon className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  if (error) return <Error error={error} />;

  return (
    <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm mb-20">
      <h2 className="text-lg font-medium">Answers</h2>
      <Input
        placeholder="Search questions..."
        value={search}
        onChange={handleSearch}
        className="mt-4"
      />
      <div className="mt-4 space-y-4">
        <div>
          {filteredQuestions.map((questionText, index) => (
            <React.Fragment key={index}>
              <div className="text-sm font-medium text-muted-foreground mt-5">
                Q: {questionText}
              </div>
              <div className="text-base font-medium">
                A:{" "}
                {(() => {
                  const answers = groupedAnswers[questionText].map((answer) =>
                    renderAnswerWithImages(answer)
                  );
                  const textAnswers = answers
                    .filter((answer) => typeof answer === "string")
                    .join(", ");
                  const imageAnswers = answers.filter(
                    (answer) => typeof answer !== "string"
                  );
                  return (
                    <>
                      {textAnswers}
                      {imageAnswers.map((image, idx) => (
                        <React.Fragment key={idx}>{image}</React.Fragment>
                      ))}
                    </>
                  );
                })()}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnswersTable;
