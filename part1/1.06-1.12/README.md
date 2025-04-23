# Feedback App – Full Stack Open (Part 1, Exercises 1.6–1.11)

This React app was built as part of the [Full Stack Open](https://fullstackopen.com/en/) course by the University of Helsinki.

## 📚 Description

The app allows users to give feedback by clicking one of three buttons: **Good**, **Neutral**, or **Bad**.

It displays real-time statistics including:

- Number of each type of feedback
- Total feedback count
- Average score
- Percentage of positive feedback

Feedback data is managed using React's `useState` hook, and the app dynamically renders statistics based on user input.

## ✅ Features

- Count clicks for each feedback type
- Calculate and display average score and positive percentage
- Conditionally show statistics or a message if no feedback has been given
- Extract reusable components (`StatisticLine`, `Statistics`, etc.)

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies  
   ```bash
   npm install
