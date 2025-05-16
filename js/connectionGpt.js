let recognizedText = "";

const OPENAI_API_KEY = "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";

const recognitionContainer = document.getElementById("recognition-animation");
const recognitionAnimation = lottie.loadAnimation({
  container: recognitionContainer,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "assets/speak/userSpeak.json"
});

const container = document.getElementById("voice-animation");
const speakAnimation = lottie.loadAnimation({
  container: container,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "assets/speak/chatSpeak.json"
});

const containerLoader = document.getElementById("loader-animation");
const LoaderAnimation = lottie.loadAnimation({
  container: containerLoader,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "assets/loader.json"
});


function startRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;

  recognitionContainer.style.display = "block";
  recognitionAnimation.play();

  recognition.onresult = (event) => {
    recognizedText = event.results[0][0].transcript;
    document.getElementById("result").textContent = "Вы сказали: " + recognizedText;
    sendToGPT(recognizedText)

    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";
  };

  recognition.onerror = (event) => {
    console.error("Ошибка распознавания:", event.error);

    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";
  };

  recognition.onend = () => {
    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";
  };

  recognition.start();
}

async function sendToGPT() {
  if (!recognizedText) return;

  containerLoader.style.display = "block";
  LoaderAnimation.play();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          { role: "system", content: "Ты - голосовой ассистент. Отвечай кратко, естественно, по делу." },
          { role: "user", content: recognizedText }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ошибка от GPT:", data.error);
      document.getElementById("result").textContent += "\nОшибка: " + data.error.message;
      return;
    }

    const reply = data.choices[0].message.content;
    document.getElementById("result").textContent += "\nGPT: " + reply;
    speakText(reply);
  } catch (err) {
    console.error("Ошибка запроса:", err);
  } finally {
  }
}

// async function speakText(text) {
//   try {
//     const response = await fetch("https://api.openai.com/v1/audio/speech", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${OPENAI_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "tts-1",
//         input: text,
//         voice: "shimmer"
//       })
//     });

//     if (!response.ok) {
//       throw new Error("Ошибка синтеза речи: " + response.statusText);
//     }

//     const audioBlob = await response.blob();
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio = new Audio(audioUrl);

//     containerLoader.style.display = "none";
//     LoaderAnimation.stop();

//     container.style.display = "block";
//     speakAnimation.play();

//     audio.onended = () => {
//       speakAnimation.stop();
//       container.style.display = "none";
//     };

//     audio.play();
//   } catch (err) {
//     console.error(err);
//     speakAnimation.stop();
//     container.style.display = "none";
//   }
// }

function speakText(text) {
  containerLoader.style.display = "none";
  LoaderAnimation.stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";

  utterance.onstart = () => {
    container.style.display = "block";
    speakAnimation.play();
  };

  utterance.onend = () => {
    speakAnimation.stop();
    container.style.display = "none";
  };

  speechSynthesis.speak(utterance);
}