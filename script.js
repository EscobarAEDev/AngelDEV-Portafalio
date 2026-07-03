import {
    FilesetResolver,
    HandLandmarker
} from "@mediapipe/tasks-vision";

const video = document.getElementById("video");

const cameraCanvas = document.getElementById("camera");
const cameraCtx = cameraCanvas.getContext("2d");

const drawCanvas = document.getElementById("draw");
const drawCtx = drawCanvas.getContext("2d");

let lastX = null;
let lastY = null;

async function start(){

    const stream = await navigator.mediaDevices.getUserMedia({
        video:true
    });

    video.srcObject = stream;

    await video.play();

    cameraCanvas.width = video.videoWidth;
    cameraCanvas.height = video.videoHeight;

    drawCanvas.width = video.videoWidth;
    drawCanvas.height = video.videoHeight;

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions:{
                modelAssetPath:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            },
            runningMode:"VIDEO",
            numHands:1
        }
    );

    function render(){

        cameraCtx.clearRect(0,0,cameraCanvas.width,cameraCanvas.height);

        cameraCtx.drawImage(
            video,
            0,
            0,
            cameraCanvas.width,
            cameraCanvas.height
        );

        const result = handLandmarker.detectForVideo(
            video,
            performance.now()
        );

        if(result.landmarks.length){

            const hand = result.landmarks[0];

            const finger = hand[8];

            const x = finger.x * drawCanvas.width;
            const y = finger.y * drawCanvas.height;

            cameraCtx.beginPath();
            cameraCtx.arc(x,y,8,0,Math.PI*2);
            cameraCtx.fillStyle="red";
            cameraCtx.fill();

            if(lastX!==null){

                drawCtx.beginPath();
                drawCtx.moveTo(lastX,lastY);
                drawCtx.lineTo(x,y);

                drawCtx.strokeStyle="#00ff00";
                drawCtx.lineWidth=5;
                drawCtx.lineCap="round";
                drawCtx.stroke();

            }

            lastX=x;
            lastY=y;

        }else{

            lastX=null;
            lastY=null;

        }

        requestAnimationFrame(render);

    }

    render();

}

start();

window.addEventListener("keydown",(e)=>{

    if(e.key==="c"){

        drawCtx.clearRect(
            0,
            0,
            drawCanvas.width,
            drawCanvas.height
        );

    }

});