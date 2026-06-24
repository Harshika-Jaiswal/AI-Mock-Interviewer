"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<string[]>([]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [finalReport, setFinalReport] = useState("");
const [reportLoading, setReportLoading] = useState(false);
const [category, setCategory] = useState("");
const [followUpQuestion, setFollowUpQuestion] = useState("");
  useEffect(() => {
  

  if (!category) return;

  fetch(
    `http://127.0.0.1:8000/question/${category}/${questionIndex}`
  )
    .then((res) => res.json())
    .then((data) => setQuestion(data.question));

}, [questionIndex, category]);

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.onresult = (event: any) => {
      setAnswer(event.results[0][0].transcript);
    };

    recognition.start();
  };
 

  
  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            answer,
          }),
        }
      );

      const data = await response.json();

      setFeedback(data.feedback);

      setAnswers((prev) => [...prev, answer]);
      setAllFeedbacks((prev) => [...prev, data.feedback]);
      const followupResponse = await fetch(
  "http://127.0.0.1:8000/followup",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      answer,
    }),
  }
);

const followupData = await followupResponse.json();

setFollowUpQuestion(followupData.question);
    } catch (error) {
      console.error(error);
      setFeedback("Failed to get feedback.");
    }

    setLoading(false);
  };
  

  const nextQuestion = async () => {
  if (questionIndex < 3) {
    setQuestionIndex((prev) => prev + 1);
    setAnswer("");
    setFeedback("");
  } else {
    setReportLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/final-feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
          }),
        }
      );

      const data = await response.json();

      setFinalReport(data.report);
      setInterviewFinished(true);
    } catch (error) {
      console.error(error);
      setFinalReport(
        "Unable to generate final interview report."
      );
      setInterviewFinished(true);
    }

    setReportLoading(false);
  }
};


if (category === "") {
  return (
    <main className="flex flex-col items-center mt-20 gap-4">

      <h1 className="text-4xl font-bold">
        Choose Interview Type
      </h1>
          <div className="flex flex-col items-center gap-3 mb-4">

  


</div>
        

      
      <button
        onClick={async () => {
          await fetch("http://127.0.0.1:8000/start/HR");
          setCategory("HR");
        }}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        HR Interview
      </button>

      <button
        onClick={async () => {
          await fetch("http://127.0.0.1:8000/start/Technical");
          setCategory("Technical");
        }}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Technical Interview
      </button>

      <button
        onClick={async () => {
          await fetch("http://127.0.0.1:8000/start/Project");
          setCategory("Project");
        }}
        className="bg-purple-600 text-white px-6 py-3 rounded"
      >
        Project Interview
      </button>

    </main>
  );
}


  if (interviewFinished) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            🎉 Interview Completed
          </h1>

          <p className="mb-8 text-gray-600">
            Here is your interview summary.
          </p>

          {answers.map((ans, index) => (
            <div
              key={index}
              className="border rounded-xl p-5 mb-5"
            >
              <h2 className="font-bold text-lg mb-2">
                Question {index + 1}
              </h2>

              <p className="mb-4">{ans}</p>

              <div className="bg-gray-100 p-4 rounded-lg">
                <strong>AI Feedback:</strong>
                <p className="whitespace-pre-line mt-2">
                  {allFeedbacks[index]}
                </p>
              </div>
            </div>
          ))}
          <div className="mt-8">

  <h2 className="text-2xl font-bold mb-4">
    Overall AI Interview Evaluation
  </h2>

  {reportLoading ? (
    <p>Generating final report...</p>
  ) : (
    <div className="bg-blue-50 p-5 rounded-lg border">
      <p className="whitespace-pre-line">
        {finalReport}
      </p>

    </div>
  )}
  <button
  onClick={() => {
    setCategory("");
    setQuestion("");
    setAnswer("");
    setFeedback("");
    setAnswers([]);
    setAllFeedbacks([]);
    setQuestionIndex(0);
    setInterviewFinished(false);
    setFinalReport("");
  }}
  className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg"
>
  Start New Interview
</button>

</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold text-center mb-8">
          AI Mock Interviewer
        </h1>

        <div className="mb-8">
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{
                width: `${((questionIndex + 1) / 4) * 100}%`,
              }}
            />
          </div>

          <p className="mt-2 text-center">
            Question {questionIndex + 1} of 4
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">

          <h2 className="text-2xl font-semibold mb-4">
            Interview Question
          </h2>

          <p className="text-lg mb-6">
            {question}
          </p>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            className="w-full border rounded-lg p-4"
            placeholder="Type your answer here..."
          />

          <div className="flex gap-4 mt-4">
            
            <button
              onClick={() => {
                setCategory("");
                setQuestion("");
                setAnswer("");
                setFeedback("");
                setAnswers([]);
                setAllFeedbacks([]);
                setQuestionIndex(0);
                setInterviewFinished(false);
                setFinalReport("");
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
            <button
              onClick={startRecording}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              🎤 Speak
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {loading
                ? "Generating Feedback..."
                : "Submit Answer"}
            </button>
          </div>

          {feedback && (
            <div className="mt-6 bg-gray-100 rounded-lg p-5">

              <h3 className="text-xl font-bold mb-3">
                AI Feedback
              </h3>

              <p className="whitespace-pre-line">
                {feedback}
              </p>
            {followUpQuestion && (
  <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
    <h3 className="font-bold">
      AI Follow-Up Question
    </h3>

    <p>{followUpQuestion}</p>
  </div>
)}
              <button
                onClick={nextQuestion}
                className="mt-5 bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                {questionIndex === 3
                  ? "Finish Interview"
                  : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}