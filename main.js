// Variables for Quiz and Timer
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 10;
let questions = [];

// Fetch questions from JSON file
async function fetchJsonQuestions() {
  try {
    const response = await fetch("questions.json"); // Fetching JSON data
    if (!response.ok) throw new Error("Failed to load questions.");
    questions = await response.json();
    if (questions.length === 0) throw new Error("No questions available.");
    
    setQuizState(); // Function call to start Quiz

  } catch (error) {
    document.getElementById("quiz-container").innerHTML = `<p class="text-danger">${error.message}</p>`;
  }
}


// Start the quiz
function setQuizState() {
  resetQuizState();
  questionDisplay();
}

// Reset quiz state
function resetQuizState() {
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 10;
  clearInterval(timerInterval);
}



// To display the current question
function questionDisplay() {
  if (currentQuestionIndex >= questions.length) {
    showScoreSummary();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const container = document.getElementById("quiz-container");

  // Progress bar width
  const progressBarWidth = ((currentQuestionIndex + 1) / questions.length) * 100;


// Dynamically updates the innerHTML of quiz container 

  container.innerHTML = `
    <!-- Quiz Header -->
    <div class="quiz-header">
      <div class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
      <div class="score">Score: ${score}/${questions.length}</div>
    </div>

    <!-- Progress Bar -->
    <div class="progress mb-3" style="height: 10px;">
      <div class="progress-bar" role="progressbar" style="width: ${progressBarWidth}%; background-color: #007bff;" aria-valuenow="${progressBarWidth}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>

    <!-- Question -->    
    <h4 class="text-center text-primary fs-5 fw-bold ">${currentQuestion.questionText}</h4>


    <!-- Options -->
    <div id="options" class="row mt-4">
      ${currentQuestion.options
        .map((option, index) =>
            `<div class="col-6 d-flex justify-content-center">
               <button class="btn btn-outline-dark option w-100" data-index="${index}" data-answer="${option}">${option}</button>
             </div>`
        )
        .join("")}
    </div>

    <!-- Result status -->
    <div id="status" class="text-center status mt-3"></div>

    <!-- Timer section -->
    <div class="timer-container mt-4">
      <i class="fas fa-clock timer-icon"></i>
      <span id="timer-text" class="timer-text">${timeLeft}s</span>
    </div>
  `;

  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach((button) =>
    button.addEventListener("click", (e) => chooseAnswer(e, currentQuestion, optionButtons))
  );

  startTimer();
}

// Manage the correct answer selection
function chooseAnswer(event, currentQuestion, buttons) {
  clearInterval(timerInterval); // reset the timer
  const selectedAnswer = event.target.getAttribute("data-answer");
  const correctAnswer = currentQuestion.answer;
  const jsonAnswer = selectedAnswer === correctAnswer;

  // Update the buttons' styles based on whether they're correct or wrong
  buttons.forEach((button) => {
    const result = button.getAttribute("data-answer") === correctAnswer;
    button.classList.remove("btn-outline-dark");

    

    if (result) {
      button.classList.add("btn-success"); // Green for correct answer
    } else if (button === event.target) {
      button.classList.add("btn-danger"); // Red for selected wrong answer
    } else {
      button.classList.add("btn-light"); // Neutral for unselected buttons
    }

    button.disabled = true; // Disable all buttons after selection
  });

  // Update score immediately if the answer is correct
  if (jsonAnswer) {
    score++;
  }
 // Update the score display function call
 updateScoreDisplay();

  // Show feedback status immediately after the selection
  showStatus(jsonAnswer, correctAnswer);

 

  // Move to the next question after a delay
  setTimeout(() => {
    displayNextQuestion();
  }, 4000); // Wait 4 seconds before moving to the next question
}


// Update the score display immediately
function updateScoreDisplay() {
  document.querySelector(".score").textContent = `Score: ${score}/${questions.length}`;
}
// Show feedback status message
function showStatus(isCorrect, correctAnswer) {
  const status = document.getElementById("status");

  if (isCorrect) {
    status.innerHTML = `<div class="alert alert-success mt-3"><strong>Hurrah!!!Correct!</strong></div>`;
  } else {
    status.innerHTML = `
      <div class="alert alert-danger mt-3" role="alert">
        <strong>Wrong!</strong> The correct answer is: <strong>${correctAnswer}</strong>
      </div>`;
  }
}



// Move to the next question
function displayNextQuestion() {
  currentQuestionIndex++;
  timeLeft = 10;
  questionDisplay();
}

// Start the countdown timer
function startTimer() {
  clearInterval(timerInterval);
  const timerText = document.getElementById("timer-text");
  const timerIcon = document.querySelector(".timer-icon");

  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = `${timeLeft}s`;

    if (timeLeft <= 3) {
      timerIcon.style.color = "#dc3545"; // Red for last 3 seconds
      timerText.style.color = "#dc3545";
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      manageTimeout();
    }
  }, 1000);
}

// Handle timeout and display feedback message when timeout
function manageTimeout() {
  const currentQuestion = questions[currentQuestionIndex];
  const status = document.getElementById("status");

  // Display feedback for timeout with the correct answer
  status.innerHTML = `<div class="alert alert-warning mt-3" role="alert">
    Time's up! The correct answer is: <strong>${currentQuestion.answer}</strong>
  </div>`;

  // Disable all option buttons and highlight the correct answer
  document.querySelectorAll(".option").forEach((button) => {
    const isCorrect = button.getAttribute("data-answer") === currentQuestion.answer;
    button.disabled = true; // Disable the button
    if (isCorrect) {
      button.classList.remove("btn-outline-dark");
      button.classList.add("btn-success"); // Highlight correct answer in green
    } else {
      button.classList.remove("btn-outline-dark");
      button.classList.add("btn-light"); // Keep incorrect answers neutral
    }
  });

  // Move to the next question after 2 seconds
  setTimeout(() => {
    displayNextQuestion();
  }, 2000);
}


// Show summary
function showScoreSummary() {
  document.getElementById("quiz-container").innerHTML = `
    <h3 class="text-center">Quiz Complete!</h3>
    <p class=" text-center text-primary"><strong>Your score: ${score} / ${questions.length}</strong></p>
    <button class="btn btn-primary d-block mx-auto" onclick="setQuizState()">Replay Quiz</button>
  `;
}

// Fetch questions and start the quiz
fetchJsonQuestions();
