const galleryInput = document.getElementById("galleryInput");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
]).then(faceRecognition);

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

  // Handle image input from the gallery
  galleryInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (file) {
      const img = await faceapi.bufferToImage(file);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

      // Display result on the console (you can customize this part)
      console.log(`Best match for gallery image: ${bestMatch.label}`);

      // Check if the best match is above a certain confidence threshold
      if (bestMatch.distance < 0.5) { // You can adjust the confidence threshold as needed
        // Navigate to the welcome page
        window.location.href = "welcome.html"; // Replace "welcome.html" with the actual path to your welcome page
      } else {
        console.log("No match found or confidence too low");
      }
    }
  });
}
