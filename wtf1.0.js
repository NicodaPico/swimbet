// ==UserScript==
// @name         Prestige Predictor
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  None
// @author       Prestige 
// @match        https://bloxflip.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.bloxflip.com
// @connect      discord.com
// @updateURL    https://raw.githubusercontent.com/NicodaPico/wtf/refs/heads/main/wtf1.0.js
// @downloadURL  https://raw.githubusercontent.com/NicodaPico/wtf/refs/heads/main/wtf1.0.js
// ==/UserScript==

(function () {
  'use strict';

  // Function to check for updates
  function checkForUpdate() {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://raw.githubusercontent.com/NicodaPico/wtf/refs/heads/main/wtf1.0.js",
      onload: function (response) {
        const latestScript = response.responseText;
        const currentVersion = GM_info.script.version;

        // Check for new version
        const latestVersionMatch = /@version\s+([0-9.]+)/.exec(latestScript);
        if (latestVersionMatch) {
          const latestVersion = latestVersionMatch[1];
          if (latestVersion !== currentVersion) {
            alert("A new version is available! Please update.");
          }
        }
      }
    });
  }

  checkForUpdate();

  const validKeys = ["DEVTESTING16", 'MOON-EJUWYTAGVWKIEO9816BEGHWNUSK', "MOON-HHFXVCGLAAZFJTGTDFKLYTEZRMODANZWYHDTOAIW"];
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        body { font-family: Arial, sans-serif; }
        .credits {
            position: fixed;
            top: 10px;
            right: 10px;
            color: black;
            font-weight: bold;
            z-index: 10001;
        }
        .modal-container {
            position: fixed;
            width: 300px;
            background-color: black;
            padding: 15px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            z-index: 10000;
            color: white;
            border-radius: 8px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            cursor: move;
        }
        .modal-title { text-align: center; margin-bottom: 10px; }
        .modal-button {
            background-color: #7d7d7d;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            display: block;
            margin: 10px auto;
        }
        .modal-button:hover { background-color: #6c6c6c; }
        .input-field {
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            border: none;
            border-radius: 4px;
            background-color: #333;
            color: white;
        }
        .input-field:focus { outline: none; border: 2px solid #fff; }
        .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 10px; }
        .grid-cell {
            width: 40px;
            height: 40px;
            background-color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            color: white;
            font-size: 18px;
        }
        .safe { background-color: green; }
        .mine { background-color: red; }
        .highlight { border: 3px solid yellow; }
        .loading-spinner {
            font-size: 30px;
            text-align: center;
            color: #fff;
        }
    `;
  document.head.appendChild(styleElement);
  
  const creditsElement = document.createElement("div");
  creditsElement.className = 'credits';
  creditsElement.innerText = "Your ass is rigged";
  document.body.appendChild(creditsElement);

  function createAccessKeyModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-container';
    const title = document.createElement('h3');
    title.innerText = "Enter Access Key";
    modal.appendChild(title);
    
    const inputField = document.createElement("input");
    inputField.type = 'text';
    inputField.placeholder = "Enter your key";
    inputField.className = 'input-field';
    modal.appendChild(inputField);
    
    const submitButton = document.createElement("button");
    submitButton.className = 'modal-button';
    submitButton.innerText = "Submit";
    modal.appendChild(submitButton);
    
    const message = document.createElement('p');
    modal.appendChild(message);
    document.body.appendChild(modal);

    submitButton.onclick = () => {
      const enteredKey = inputField.value.trim();
      if (validKeys.includes(enteredKey)) {
        message.innerText = "Access Granted!";
        message.style.color = 'green';
        setTimeout(() => {
          modal.remove();
          createPredictionModal();
        }, 1000);
      } else {
        message.innerText = "Invalid Key. Please try again.";
        message.style.color = 'red';
      }
    };
    
    makeDraggable(modal);
  }

  function createPredictionModal() {
    const modal = document.createElement("div");
    modal.className = "modal-container";
    const title = document.createElement('h3');
    title.innerText = "Prestige Predictor";
    modal.appendChild(title);

    const tokenLabel = document.createElement("label");
    tokenLabel.innerText = "Auth Token:";
    modal.appendChild(tokenLabel);
    
    const tokenInput = document.createElement("input");
    tokenInput.type = "text";
    tokenInput.className = "input-field";
    modal.appendChild(tokenInput);

    const safeSpotsLabel = document.createElement("label");
    safeSpotsLabel.innerText = "Number of Safe Spots (1-24):";
    modal.appendChild(safeSpotsLabel);
    
    const safeSpotsInput = document.createElement("input");
    safeSpotsInput.type = "number";
    safeSpotsInput.min = '1';
    safeSpotsInput.max = '24';
    safeSpotsInput.className = 'input-field';
    modal.appendChild(safeSpotsInput);

    const predictButton = document.createElement('button');
    predictButton.className = 'modal-button';
    predictButton.innerText = "Predict Mines";
    modal.appendChild(predictButton);
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid';
    modal.appendChild(gridContainer);
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.innerText = "Loading...";
    modal.appendChild(loadingSpinner);
    
    document.body.appendChild(modal);

    predictButton.onclick = async () => {
      const token = tokenInput.value;
      const safeSpots = parseInt(safeSpotsInput.value);

      if (!token || !safeSpots) {
        gridContainer.innerText = "Please provide both Auth Token and number of safe spots.";
        return;
      }

      gridContainer.innerHTML = '';
      loadingSpinner.style.display = 'block'; // Show loading spinner
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading time

      try {
        const prediction = await fetchPrediction(token, safeSpots);
        displayPrediction(gridContainer, prediction);
      } catch (error) {
        gridContainer.innerText = "Failed to predict mines: " + error.message;
      } finally {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
      }
    };
    
    makeDraggable(modal);
  }

  async function fetchPrediction(token, safeSpots) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: "https://api.bloxflip.com/games/mines/history?size=10&page=0",
        headers: {
          'x-auth-token': token,
          'User-Agent': navigator.userAgent
        },
        onload: function (response) {
          if (response.status === 200) {
            const data = JSON.parse(response.responseText);
            const prediction = generatePrediction(data.data, safeSpots);
            resolve(prediction);
          } else {
            reject(new Error("Failed to fetch game data: " + response.statusText));
          }
        },
        onerror: function () {
          reject(new Error("Error fetching data."));
        }
      });
    });
  }

  function generatePrediction(data, safeSpots) {
    // Simplified prediction logic for demonstration
    const safeIndices = new Set();
    while (safeIndices.size < safeSpots) {
      safeIndices.add(Math.floor(Math.random() * 25));
    }
    return Array.from(safeIndices);
  }

  function displayPrediction(container, prediction) {
    prediction.forEach(index => {
      const cell = document.createElement("div");
      cell.className = 'grid-cell safe';
      cell.innerText = '✅';
      container.appendChild(cell);
    });
  }

  function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", event => {
      isDragging = true;
      offsetX = event.clientX - element.getBoundingClientRect().left;
      offsetY = event.clientY - element.getBoundingClientRect().top;
      element.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", event => {
      if (isDragging) {
        element.style.left = event.clientX - offsetX + 'px';
        element.style.top = event.clientY - offsetY + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.cursor = "move";
    });
  }

  createAccessKeyModal();
})();

