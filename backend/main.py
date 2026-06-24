from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os
import random

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

questions = {
    "HR": [
        "Tell me about yourself.",
        "What are your strengths?",
        "What are your weaknesses?",
        "Why should we hire you?"
    ],

    "Technical": [
    "What is a binary search tree?",
    "Explain time complexity.",
    "Difference between stack and queue?",
    "What is dynamic programming?",
    "What is the difference between an array and a linked list?",
    "Explain recursion with an example.",
    "What is a hash table and how does it work?",
    "What is the difference between BFS and DFS?",
    "What are the four pillars of Object-Oriented Programming?",
    "What is polymorphism in OOP?",
    "Difference between process and thread?",
    "What is a deadlock and how can it be prevented?",
    "Explain database normalization.",
    "What is the difference between SQL and NoSQL databases?",
    "What are primary keys and foreign keys?",
    "What is indexing in databases?",
    "Explain ACID properties in DBMS.",
    "What is the difference between TCP and UDP?",
    "What happens when you type a URL in a browser?",
    "What is REST API?",
    "Difference between authentication and authorization?",
    "What is a mutex?",
    "What is caching and why is it used?",
    "What is binary search?",
    "Explain merge sort and its complexity.",
    "What is a heap data structure?",
    "Difference between min heap and max heap?",
    "What is memoization?",
    "Difference between compile time and run time errors?",
    "Explain MVC architecture.",
    "What is a virtual function in C++?",
    "What is function overloading?",
    "Difference between abstraction and encapsulation?",
    "What is a race condition?",
    "What is a semaphore?",
    "What is multithreading?",
    "What is a transaction in DBMS?",
    "What are joins in SQL?",
    "Difference between INNER JOIN and LEFT JOIN?",
    "What is the CAP theorem?"
     ],

    "Project": [
        "Describe your best project.",
        "What challenges did you face?",
        "How did you solve them?",
        "What improvements would you make?"
    ]
}
selected_technical_questions = []


@app.get("/")
def home():
    return {"message": "Backend Working"}


@app.get("/start/{category}")
def start_interview(category: str):

    global selected_technical_questions

    if category == "Technical":
        selected_technical_questions = random.sample(
            questions["Technical"],
            4
        )

    return {
        "message": "Interview Started"
    }
@app.get("/question/{category}/{id}")
def get_question(category: str, id: int):

    if category == "Technical":
        return {
            "question": selected_technical_questions[id]
        }

    return {
        "question": questions[category][id]
    }
class AnswerRequest(BaseModel):
    question: str
    answer: str

class InterviewRequest(BaseModel):
    answers: list[str]
@app.post("/feedback")
def get_feedback(data: AnswerRequest):

    prompt = f"""
You are an interview evaluator.

Question:
{data.question}

Candidate Answer:
{data.answer}

Give:
1. Score out of 10
2. Strengths
3. Improvements

Keep the response under 150 words.
"""

    response = model.generate_content(prompt)

    return {
        "feedback": response.text
    }

@app.post("/followup")
def followup(data: AnswerRequest):

    prompt = f"""
You are an interviewer.

Question:
{data.question}

Candidate Answer:
{data.answer}

Generate ONE follow-up interview question.
Only return the question.
"""

    response = model.generate_content(prompt)

    return {
        "question": response.text
    }



@app.post("/final-feedback")
def final_feedback(data: InterviewRequest):
    try:
        prompt = f"""
You are a professional interview evaluator.

The candidate gave these answers:

{chr(10).join(data.answers)}

Analyze the entire interview and provide:

1. Overall Score (out of 10)
2. Communication Skills (out of 10)
3. Technical Knowledge (out of 10)
4. Confidence Level (out of 10)
5. Strengths
6. Areas for Improvement
7. Hiring Recommendation (Yes / No)

Keep the report professional and under 250 words.
"""

        response = model.generate_content(prompt)

        return {
            "report": response.text
        }

    except Exception as e:
        return {
            "report": f"Unable to generate AI report right now.\n\nError: {str(e)}"
        }