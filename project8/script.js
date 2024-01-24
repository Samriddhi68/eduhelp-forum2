const firebaseConfig = {
  apiKey: "AIzaSyBgfS31_rkbCQl1kplgNeSsGW8pF5Q8dB0",
  authDomain: "eduhelp-forum-5aaa0.firebaseapp.com",
  projectId: "eduhelp-forum-5aaa0",
  storageBucket: "eduhelp-forum-5aaa0.appspot.com",
  messagingSenderId: "986564422440",
  appId: "1:986564422440:web:9e6d6d385ae824939bbe1d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser;

auth.onAuthStateChanged((user) => {
  currentUser = user;

  if (user) {
    setupDoubtForm(user);
    displayDoubts();
  } else {
    console.log("User not authenticated");
  }
});

function setupDoubtForm(user) {
  const doubtForm = document.getElementById('doubt-form');
  const answerForm = document.getElementById('answer-form');

  doubtForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const doubtText = document.getElementById('doubt-text').value;

    const newDoubt = {
      text: doubtText,
      userId: user.uid,
      displayName: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      answers: []
    };

    console.log('New Doubt:', newDoubt);

    db.collection('doubts')
      .add(newDoubt)
      .then(() => {
        alert('Doubt submitted successfully!');
        doubtForm.reset();
      })
      .catch((error) => {
        console.error('Error adding doubt: ', error);
        alert('Error submitting doubt. Please try again.');
      });
  });

  answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAnswerSubmission();
  });
}

function handleAnswerSubmission() {
  const answerText = document.getElementById('answer-text').value;
  const doubtId = document.getElementById('selected-doubt-id').value;

  const newAnswer = {
    text: answerText,
    userId: currentUser.uid,
    displayName: currentUser.displayName,
    timestamp: new Date(),
  };

  console.log('Updating doubt with ID:', doubtId);

  db.runTransaction((transaction) => {
    const doubtRef = db.collection('doubts').doc(doubtId);

    return transaction.get(doubtRef).then((doc) => {
      if (!doc.exists) {
        throw new Error('Document does not exist!');
      }

      const currentAnswers = doc.data().answers || [];
      currentAnswers.push(newAnswer);

      transaction.update(doubtRef, { answers: currentAnswers });
    });
  })
    .then(() => {
      alert('Answer submitted successfully!');
      document.getElementById('answer-form').reset();
      hideAnswerForm();
    })
    .catch((error) => {
      console.error('Error adding answer: ', error);
      alert('Error submitting answer. Please try again.');
    });
}

function displayDoubts() {
  const doubtsList = document.getElementById('doubts-list');

  db.collection('doubts').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
    doubtsList.innerHTML = '';

    snapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      const formattedTime = timestamp.toLocaleString();

      const doubtHTML = `
        <div class="doubt">
          <p>${data.text}</p>
          <span>Posted by ${data.displayName} on ${formattedTime}</span>
          <button onclick="showAnswerForm('${doc.id}')">Answer</button>
        </div>
      `;

      doubtsList.innerHTML += doubtHTML;

      if (data.answers && Array.isArray(data.answers)) {
        data.answers.forEach((answer) => {
          const answerTimestamp = answer.timestamp.toDate();
          const formattedAnswerTime = answerTimestamp.toLocaleString();

          const answerHTML = `
            <div class="answer">
              <p>${answer.text}</p>
              <span>Answered by ${answer.displayName} on ${formattedAnswerTime}</span>
            </div>
          `;

          doubtsList.innerHTML += answerHTML;
        });
      }
    });
  });
}

function showAnswerForm(doubtId) {
  document.getElementById('selected-doubt-id').value = doubtId;
  document.getElementById('answer-form-container').style.display = 'block';
}

function hideAnswerForm() {
  document.getElementById('answer-form-container').style.display = 'none';
}
