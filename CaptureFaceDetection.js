const video = document.getElementById("video");
const galleryInput = document.getElementById("galleryInput");
let capturedImage;

// Load face-api.js models and start webcam
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
])
  .then(startWebcam)
  .then(captureImage)
  .then(faceRecognition);

function startWebcam() {
  return navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function captureImage() {
  return new Promise((resolve) => {
    // Assuming you have a button with id "captureButton" to trigger image capture
    const captureButton = document.getElementById("captureButton");

    captureButton.addEventListener("click", () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      const context = canvas.getContext("2d");
      canvas.width = video.width;
      canvas.height = video.height;

      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, video.width, video.height);

      // Convert the canvas content to a data URL
      capturedImage = canvas.toDataURL("image/jpeg");
        // console.log("capture image", capturedImage)
      // Optionally, you can display the captured image on the page
      const capturedImageElement = document.getElementById("capturedImage");
      capturedImageElement.src = capturedImage;

      // Stop the webcam
      video.srcObject.getTracks().forEach((track) => track.stop());

      // Resolve the promise with the captured image data URL
      resolve(capturedImage);
    });
  });
}

function getLabeledFaceDescriptions() {
  const labels = ["ajay", "rohit", "virat"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

async function faceRecognition() {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  // Process the captured image
  const img = await faceapi.fetchImage(capturedImage);
  const detections = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  const result = faceMatcher.findBestMatch(detections.descriptor);
  console.log(`Best match for gallery image: ${result.label}`);

  // Check if a match is found
  if (result.distance < 0.5) {
    // Navigate to the welcome page
    window.location.href = 'welcome.html';
  } else {
    // Handle case where no match is found
    alert("No match found.");
  }
}
