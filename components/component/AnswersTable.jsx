import { useEffect, useState, useMemo, useContext } from "react";
import React from "react";
import axios from "axios";
import Error from "@/components/component/Error";
import { Input } from "@/components/ui/input";
import { UpdateIcon } from "@radix-ui/react-icons";
import { AppContext } from "@/context/AppContext";

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
  const { dbConfig } = useContext(AppContext);

  useEffect(() => {
    if (surveyId && interviewId) {
      const fetchAnswers = async () => {
        try {
          const dbPasswordString = Buffer.from(
            dbConfig.dbpassword.data
          ).toString("utf-8");
          const response = await axios.get(`/api/answers`, {
            headers: {
              "X-DB-Server": dbConfig.dbserver,
              "X-DB-Database": dbConfig.dbdatabase,
              "X-DB-User": dbConfig.dbuser,
              "X-DB-Password": dbPasswordString,
            },
            params: { surveyId, interviewId },
          });

          const data = response.data;
          const grouped = data.reduce((acc, answer) => {
            const isSubQuestion = /F\d+$/.test(answer.NfieldQuestionId);
            const mainQuestionKey = isSubQuestion
              ? answer.NfieldQuestionId.replace(/F\d+$/, "") // Remove F and digits after it
              : answer.NfieldQuestionId;
            const questionText = answer.QuestionText
              ? answer.QuestionText.trim()
              : "";
            const subQuestionKey = isSubQuestion
              ? questionText.split(" ").slice(-1)[0] // Use the last word as the sub-question label (like "Transportation")
              : null;

            if (!acc[mainQuestionKey]) {
              acc[mainQuestionKey] = {
                questionText,
                originalKey: mainQuestionKey + ":", // Display only the main part of the question key
                answers: [],
              };
            }

            const values = [
              answer.AlphaValue,
              answer.NumericValue,
              answer.CategoryValueText,
            ].filter((value) => value !== null && value !== "NULL");

            if (values.length > 0) {
              if (isSubQuestion) {
                acc[mainQuestionKey].answers.push({
                  label: subQuestionKey,
                  value: values.join(", "),
                });
              } else {
                acc[mainQuestionKey].answers.push({
                  label: null,
                  value: values.join(", "),
                });
              }
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
    return Object.keys(groupedAnswers).filter((questionKey) =>
      groupedAnswers[questionKey]?.questionText
        ?.toLowerCase()
        .includes(searchValue)
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
          {filteredQuestions.map((questionKey, index) => (
            <React.Fragment key={index}>
              <div className="text-sm font-medium text-muted-foreground mt-5">
                <strong>{groupedAnswers[questionKey]?.originalKey}</strong>{" "}
                {groupedAnswers[questionKey]?.questionText}
              </div>
              <div className="text-base font-medium">
                {groupedAnswers[questionKey]?.answers.map((answer, idx) => (
                  <div key={idx}>
                    {answer.label ? <strong>{answer.label}: </strong> : null}
                    {renderAnswerWithImages(answer.value)}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnswersTable;
