const URL = './model/';  // 모델이 저장된 경로

let model, webcam, labelContainer, maxPredictions;

// 모델을 로드합니다.
async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    // 모델과 metadata를 로드합니다.
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // 웹캠 설정
    const flip = true;
    webcam = new tmImage.Webcam(224, 224, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    // 웹캠을 화면에 추가합니다.
    document.getElementById('webcam').appendChild(webcam.canvas);
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement('div'));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// 예측을 수행하고 결과를 출력합니다.
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // 예측 결과에 따라 음성 합성을 수행합니다.
        if (prediction[i].probability.toFixed(2) > 0.9) {
            if (prediction[i].className === 'Fork') {
                speak("This is a fork.");
            } else if (prediction[i].className === 'Knife') {
                speak("This is a knife.");
            }
        }
    }
}

// 음성 합성 기능
function speak(text) {
    if ('speechSynthesis' in window) {
        var msg = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(msg);
    } else {
        alert("This browser does not support speech synthesis.");
    }
}

// 초기화 함수 호출
init();