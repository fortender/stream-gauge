// Establish a WebSocket connection
const ws = new WebSocket('ws://localhost:9090/gauge');

// This function is called when the websocket successfully connected to the server
ws.onopen = function(event) {
    console.log('Connected to WebSocket');
};

// This function is called when the websocket received a message from the server
// event.data contains the string or blob of data that was transmitted
ws.onmessage = function(event) {

    // Information is exchanged through JSON strings
    // The server serializes objects into JSON strings and sends them via websocket to the clients
    // We therefore have to deserialize the JSON string into objects to further work with them
    let gaugeEvent = JSON.parse(event.data);

    // The object received from the server should contain an event property that has a known event name
    // such as "updateConfig" which tells us that the object's data property contains the new config we
    // have to apply to the gauge.
    switch (gaugeEvent.event) {
        case "updateConfig":
            updateGauge(gaugeEvent.data);
        default:
            console.debug(event.data, gaugeEvent);
    }
};

function getDefaultConfig() {
    return {
        "min": 0,
        "max": 100,
        "start": 100, // If not set, start with max
        "updateInterval": 1000, // Pointer updates position after 1s
        "atMinAfter": 30000 // Minimum is reached after 30s
    }
}

// Linear interpolates between two values based on the given percentage [0; 1]
// Returns min if percentage = 0
// Returns max if percentage = 1
function lerp(min, max, percentage) {
    return min + (max - min) * percentage;
}

// Given an interval [min; max] returns value in the interval [0; 1]
// Example: Given the following values:
// - min = 20
// - max = 50
// - value = 35
// returns: 0.5 (50%)
function ilerp(min, max, value) {
    return (value - min) / (max - min);
}

// Ensures that min <= value <= max
// Returns min if value < min
// Returns max if value > max
function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

let currentGaugeValue = 0; // Global variable that stores the current value of the gauge
let currentIntervalId = Number.NaN; // Global variable that holds the id of the registered interval, in order to unregister the interval later on

function updateGauge(config) {
    // Unregister the current interval if given
    if (!isNaN(currentIntervalId)) {
        clearInterval(currentIntervalId);
        currentIntervalId = Number.NaN;
    }
    
    var updateGaugeValue = (value) => {
        // Angle calculation
        // We need to fit the gauge value range into the gauge's angle range
        // -90° (minimum -> left side) and
        // +90° (maximum -> right side)
        currentGaugeValue = clamp(value, config.min, config.max);
        let currentGaugePercentage = ilerp(config.min, config.max, currentGaugeValue);
        let angle = lerp(-90, 90, currentGaugePercentage);
        let gaugeHand = document.querySelector('.gaugehand');
        gaugeHand.style.transform = `rotate(${angle}deg)`;
    };

    // Set minimum and maximum text
    document.getElementById("minimum").innerText = `${config.min} Bits`;
    document.getElementById("maximum").innerText = `${config.max} Bits`;

    // Set the gauge to the start value, fallback to maximum
    updateGaugeValue(config.start || config.max);

    // Calculate the step per update
    const updateStep = (config.max - config.min) / (config.atMinAfter / config.updateInterval);

    // Decrement over time until the gauge reaches the minimum
    currentIntervalId = setInterval(function() {
        currentGaugeValue -= updateStep;

        if (currentGaugeValue <= config.min) {
            clearInterval(currentIntervalId);
            currentIntervalId = Number.NaN;
            ws.send(JSON.stringify({
                "event": "minimumReached"
            }));
        }
        
        updateGaugeValue(currentGaugeValue);
    }, config.updateInterval);
}

// Simulate a message received from the WebSocket after 2 seconds
// setTimeout(() => ws.onmessage(getDefaultConfig()), 2000);
