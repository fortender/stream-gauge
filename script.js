// Establish a WebSocket connection
const ws = new WebSocket('ws://localhost:9090/gauge');

ws.onopen = function(event) {
    console.log('Connected to WebSocket');
};

ws.onmessage = function(event) {
    let gaugeEvent = JSON.parse(event.data);
    if (gaugeEvent.event === "updateConfig") {
        updateGauge(gaugeEvent.data);
    } else {
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

function lerp(min, max, percentage) {
    return min + (max - min) * percentage;
}

function ilerp(min, max, value) {
    return (value - min) / (max - min);
}

function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

let currentGaugeValue = 0;
let currentIntervalId = Number.NaN;

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
