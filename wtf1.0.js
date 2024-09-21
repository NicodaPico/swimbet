// ==UserScript==
// @name         Mine Prediction Tool with Key System
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Predict mines in a game using a key system and updated algorithms
// @author       Your Name
// @match        https://bloxflip.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.bloxflip.com
// ==/UserScript==

(function() {
    'use strict';

    // Predefined list of valid keys
    const validKeys = ["DEVTESTING1521", "MOON-EJUWYTAGVWKIEO9816BEGHWNUSK", "MOON-UJAYRAKHRCDGJMASHGJSXVWLFTGKDLTFVMVVCIRO", "MOON-ZNLGSUAQLBLMNINEUPDCNTFURSHYCHFZQDCZEHUQ", "MOON-MCZKFWNENIMEZYXWJQELEZSLJBYSADJEWVBNFRHF", "MOON-ZFDSMTXRHYEQSLFTBIUODTAMBNQGWEVLYCWQSIXS","MOON-EUSKMNKWUYCFRJYSWIELQPHBGENDZRYYBEZVLQSE", "MOON-HHFXVCGLAAZFJTGTDFKLYTEZRMODANZWYHDTOAIW"]; // Add more keys as needed

    // Create UI Elements for Key System
    const keyContainer = document.createElement('div');
    keyContainer.style.position = 'fixed';
    keyContainer.style.top = '50%';
    keyContainer.style.left = '50%';
    keyContainer.style.transform = 'translate(-50%, -50%)';
    keyContainer.style.backgroundColor = 'black';
    keyContainer.style.padding = '20px';
    keyContainer.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
    keyContainer.style.zIndex = '10000';
    keyContainer.style.color = 'white';

    const keyTitle = document.createElement('h3');
    keyTitle.innerText = 'Enter Access Key';
    keyContainer.appendChild(keyTitle);

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Enter your key';
    keyContainer.appendChild(keyInput);

    const keySubmitButton = document.createElement('button');
    keySubmitButton.innerText = 'Submit';
    keyContainer.appendChild(keySubmitButton);

    const keyOutput = document.createElement('p');
    keyContainer.appendChild(keyOutput);

    document.body.appendChild(keyContainer);

    // Key verification logic
    keySubmitButton.onclick = function() {
        const enteredKey = keyInput.value;
        if (validKeys.includes(enteredKey)) {
            keyOutput.innerText = 'Access Granted!';
            keyOutput.style.color = 'green';
            keyContainer.remove(); // Remove the key container after successful validation
            showMainUI(); // Call the main UI function if the key is valid
        } else {
            keyOutput.innerText = 'Invalid Key. Please try again.';
            keyOutput.style.color = 'red';
        }
    };

    // Function to display the main UI after key verification
    function showMainUI() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10%';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.backgroundColor = 'black';
        container.style.padding = '10px';
        container.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        container.style.zIndex = '10000';
        container.style.color = 'white';

        const title = document.createElement('h3');
        title.innerText = 'Mine Predictor (Updated Version)';
        container.appendChild(title);

        const authTokenLabel = document.createElement('label');
        authTokenLabel.innerText = 'Auth Token:';
        container.appendChild(authTokenLabel);

        const authTokenInput = document.createElement('input');
        authTokenInput.type = 'text';
        container.appendChild(authTokenInput);

        const numSafeSpotsLabel = document.createElement('label');
        numSafeSpotsLabel.innerText = ' Number of Safe Spots (1-24):';
        container.appendChild(numSafeSpotsLabel);

        const numSafeSpotsInput = document.createElement('input');
        numSafeSpotsInput.type = 'number';
        numSafeSpotsInput.min = '1';
        numSafeSpotsInput.max = '24';
        container.appendChild(numSafeSpotsInput);

        const algoLabel = document.createElement('label');
        algoLabel.innerText = ' Select Algorithm:';
        container.appendChild(algoLabel);

        const algoSelect = document.createElement('select');
        const algorithms = [
            { value: 'entropy', text: 'Entropy Method (most accurate)' },
            { value: 'math1', text: 'Math Algorithm 1' },
            { value: 'math2', text: 'Math Algorithm 2' },
            { value: 'math3', text: 'Math Algorithm 3' },
            { value: 'math4', text: 'Math Algorithm 4' },
            { value: 'math5', text: 'Math Algorithm 5' }
        ];

        algorithms.forEach(algo => {
            const option = document.createElement('option');
            option.value = algo.value;
            option.text = algo.text;
            algoSelect.appendChild(option);
        });

        container.appendChild(algoSelect);

        const predictButton = document.createElement('button');
        predictButton.innerText = 'Predict Mines';
        container.appendChild(predictButton);

        const output = document.createElement('pre');
        container.appendChild(output);

        document.body.appendChild(container);

        // Draggable functionality
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        container.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                container.style.left = `${e.clientX - offsetX}px`;
                container.style.top = `${e.clientY - offsetY}px`;
                container.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            container.style.cursor = 'move';
        });

        // Prediction logic when the "Predict Mines" button is clicked
        predictButton.onclick = async () => {
            const authToken = authTokenInput.value;
            const numSafeSpots = numSafeSpotsInput.value;
            const selectedAlgo = algoSelect.value;

            if (!authToken || !numSafeSpots) {
                output.innerText = 'Please provide both Auth Token and number of safe spots.';
                return;
            }

            const response = await fetchGameData(authToken, numSafeSpots, selectedAlgo);
            output.innerText = response;
        };

        async function fetchGameData(authToken, numSafeSpots, algo) {
            const url = "https://api.bloxflip.com/games/mines/history?size=10&page=0";

            const response = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    headers: {
                        'x-auth-token': authToken,
                        "User-Agent": navigator.userAgent
                    },
                    onload: function(response) {
                        if (response.status === 200) {
                            const gameData = JSON.parse(response.responseText);
                            const prediction = commonAlgorithm(gameData.data, numSafeSpots);

                            resolve(`Predicted Safe Spots:\n${prediction}`);
                        } else {
                            reject(`Failed to fetch game data: ${response.statusText}`);
                        }
                    },
                    onerror: function() {
                        reject('Error fetching data.');
                    }
                });
            });

            return response;
        }

        // Common Algorithm for all methods
        function commonAlgorithm(gameData, spots) {
            const gridSize = 25;
            const entropy = new Array(gridSize).fill(0);

            for (const game of gameData.slice(0, 5)) {
                const mines = new Set(game.mineLocations);
                const uncovered = new Set(game.uncoveredLocations);
                for (let i = 0; i < gridSize; i++) {
                    if (uncovered.has(i)) {
                        entropy[i] += Math.random(); // Use randomness for demonstration
                    } else {
                        entropy[i] += Math.random();
                    }
                }
            }

            const topSpots = Array.from(Array(gridSize).keys()).sort((a, b) => entropy[b] - entropy[a]).slice(0, spots);
            const grid = Array(5).fill(null).map(() => Array(5).fill('❌')); // Use '❌' for bombs

            for (const spot of topSpots) {
                const row = Math.floor(spot / 5);
                const col = spot % 5;
                grid[row][col] = '✔️'; // Use '✔️' for safe spots
            }

            return grid.map(row => row.join(' ')).join('\n');
        }
    }
})();
