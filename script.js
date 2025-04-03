document.addEventListener("DOMContentLoaded", function () {
    const video = document.createElement("video");
    const canvasElement = document.getElementById("canvas");
    const canvas = canvasElement.getContext("2d");
    const scanResult = document.getElementById("scan-result");
    const scanAgainBtn = document.getElementById("scan-again");
    let scanning = false;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            scanning = true;
            requestAnimationFrame(tick);
        });

    function tick() {
        if (scanning) {
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                scanning = false;
                video.srcObject.getTracks().forEach(track => track.stop());

                fetchGuestDetails(code.data);
            } else {
                requestAnimationFrame(tick);
            }
        }
    }

    function fetchGuestDetails(qrCode) {
        fetch("https://raw.githubusercontent.com/kalfking-qr-scanner/main/guests.json")
            .then(response => response.json())
            .then(data => {
                let guest = data.find(g => g.id === qrCode);
                if (guest) {
                    scanResult.innerHTML = `
                        <h3>Guest Details:</h3>
                        <p><strong>Name:</strong> ${guest.name}</p>
                        <p><strong>Phone:</strong> ${guest.tel}</p>
                        <p><strong>Website:</strong> <a href="${guest.url}" target="_blank">${guest.url}</a></p>
                        <img src="https://raw.githubusercontent.com/kalfking-qr-scanner/main/public/${guest.logo}" width="100">
                    `;
                } else {
                    scanResult.innerHTML = `<p style="color: red;">Guest not found!</p>`;
                }
                scanAgainBtn.style.display = "block";
            })
            .catch(error => {
                scanResult.innerHTML = `<p style="color: red;">Error fetching guest details.</p>`;
            });
    }

    scanAgainBtn.addEventListener("click", function () {
        window.location.reload();
    });
});
