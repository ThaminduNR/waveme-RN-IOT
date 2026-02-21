# Waveme IoT Integration — Technical Documentation

## Overview

Waveme is a gesture-controlled smart lighting system. A user holds up their hand in front of a mobile phone camera; a trained MediaPipe gesture recognition model classifies the gesture in real time, and the classification is translated into a lighting command that travels over a local Wi-Fi network to an ESP32 microcontroller, which physically dims or switches an AC filament bulb via a TRIAC-based dimmer module.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOCAL Wi-Fi NETWORK                         │
│                                                                     │
│  ┌──────────────┐     HTTP POST      ┌──────────────────────────┐  │
│  │   Android    │ ──────────────────▶│   HTTP-to-MQTT Relay     │  │
│  │  (Waveme App)│  192.168.1.187:3000│   Node.js  (Port 3000)   │  │
│  └──────────────┘                   └────────────┬─────────────┘  │
│                                                   │ MQTT Publish   │
│                                                   ▼                │
│                                      ┌────────────────────────┐   │
│                                      │  Mosquitto MQTT Broker │   │
│                                      │  TCP  Port 1883        │   │
│                                      │  WS   Port 9001        │   │
│                                      └────────────┬───────────┘   │
│                                                   │ MQTT Subscribe │
│                                                   ▼                │
│                                      ┌────────────────────────┐   │
│                                      │  ESP32 (NodeMCU)       │   │
│                                      │  Topic: waveme/dimmer  │   │
│                                      └────────────┬───────────┘   │
│                                                   │ GPIO Signals  │
└───────────────────────────────────────────────────┼───────────────┘
                                                    ▼
                                       ┌────────────────────────┐
                                       │  AC Dimmer Module      │
                                       │  (Optimus OP0135)      │
                                       │  TRIAC + ZC Detector   │
                                       └────────────┬───────────┘
                                                    │ AC Mains
                                                    ▼
                                       ┌────────────────────────┐
                                       │  Filament Bulb (AC)    │
                                       └────────────────────────┘
```

### Data Flow Summary

1. Camera feed → MediaPipe gesture classification (on-device, real time)
2. Classified gesture → HTTP POST to relay server (`{"action": "ON"}`)
3. Relay server → MQTT publish to broker on topic `waveme/dimmer`
4. ESP32 (subscribed) → receives JSON message → updates `dimmerValue`
5. Zero-crossing ISR → drives TRIAC gate pin at the correct phase angle
6. Filament bulb output changes

---

## 2. Hardware Components

### 2.1 ESP32 — NodeMCU ESP32 (MD0935)

| Specification | Value |
|---|---|
| Microcontroller | Espressif ESP32-WROOM-32 |
| CPU | Dual-core Xtensa LX6, up to 240 MHz |
| Flash | 4 MB |
| SRAM | 520 KB |
| Wi-Fi | 802.11 b/g/n (2.4 GHz) |
| Connectivity | USB Type-C (programming & power) |
| GPIO | 30 pins |
| Logic Level | 3.3 V |
| Development | Arduino IDE (ESP32 Arduino Core 3.x) |

### 2.2 AC Dimmer Module — Optimus OP0135

| Specification | Value |
|---|---|
| Input Voltage | 5 V DC (logic supply) |
| AC Rating | 240 VAC, 5 A maximum |
| Logic Level | Compatible with 3.3 V and 5 V |
| Zero-Crossing | Built-in detector (outputs a pulse at each AC zero crossing) |
| Control | TRIAC phase-angle control via gate pin |
| Control Method | Arduino-compatible (`RBDDimmer` or manual ISR) |

### 2.3 Physical Wiring / Pinout

```
ESP32 GPIO 12 (D12)  ──────▶  Dimmer ZC  (Zero Crossing output)
ESP32 GPIO 13 (D13)  ──────▶  Dimmer PWM (TRIAC gate input)
ESP32 GND            ──────▶  Dimmer GND
ESP32 3.3V / 5V      ──────▶  Dimmer VCC (5V preferred)

Dimmer AC-IN         ──────▶  Mains Live / Neutral
Dimmer LOAD          ──────▶  Filament Bulb (replaces switch in series)
```

> **Safety note:** The AC side of the dimmer module carries mains voltage. The optocoupler inside the module provides galvanic isolation between the low-voltage control side and the high-voltage AC side.

---

## 3. AC Dimming — Phase-Angle Control

### 3.1 Principle

An AC mains waveform (230 V, 50 Hz in Sri Lanka) crosses zero voltage 100 times per second (twice per cycle). A TRIAC is a bidirectional switch: once triggered with a short gate pulse, it conducts current until the current naturally drops to zero at the next zero crossing. By delaying the gate trigger pulse relative to the zero crossing, only a portion of each half-cycle passes through to the load. A longer delay = less energy = dimmer bulb.

```
AC Sine Wave:
     +│   /\      /\
      │  /  \    /  \
      │ /    \  /    \
  0───┼/──────\/──────\──── Time
      │\              /
      │ \            /
     -│  \          /
          ↑          ↑
     Zero Crossing  Zero Crossing
     (ISR fires)    (100 times/sec at 50Hz)

Phase angle delay:
  ├──delay──┤ trigger ├── TRIAC ON ──┤
  0         t         t+20µs         zero crossing
```

The longer the delay `t`, the smaller the shaded area (power delivered), and the dimmer the bulb.

### 3.2 Zero-Crossing Interrupt

The dimmer module outputs a 3.3 V pulse on the ZC pin at every zero crossing. The ESP32 detects the **rising edge** of this pulse via a hardware interrupt and calls `handleZeroCrossing()` immediately, placed in IRAM so it executes from fast internal RAM.

```cpp
attachInterrupt(digitalPinToInterrupt(ZC_PIN), handleZeroCrossing, RISING);
```

### 3.3 Noise Filtering (Blanking Window)

Electrical noise on the mains can produce false pulses that look like zero crossings. A simple time-based filter rejects any pulse that arrives within 7 ms of the previous one. At 50 Hz, genuine zero crossings are exactly 10 ms apart, so anything closer than 7 ms is noise:

```cpp
if (interrupt_time - last_interrupt_time < 7000) return; // 7000 µs = 7 ms
```

This ensures exactly 100 ISR executions per second — confirmed during development via a counter printed to the Serial Monitor.

### 3.4 Phase-Angle Delay Calculation

Inside the ISR, `delayMicroseconds()` is used to pause before triggering the TRIAC gate:

```cpp
int delayTime = (100 - dimmerValue) * 83;
delayMicroseconds(delayTime);
digitalWrite(DIM_PIN, HIGH);
delayMicroseconds(20);   // 20 µs gate trigger pulse
digitalWrite(DIM_PIN, LOW);
```

| `dimmerValue` | Delay (µs) | Conduction % | Bulb |
|---|---|---|---|
| 95 (MAX) | 415 µs | ~95% | Full brightness |
| 50 | 4150 µs | ~50% | Half brightness |
| 20 (MIN) | 6640 µs | ~20% | Low glow |
| 0 (OFF) | — | 0% | Off (DIM_PIN held LOW) |

The factor `83` comes from dividing the 50 Hz half-cycle period (10,000 µs) by 100 percentage steps: `10000 / 100 = 100 µs`, then adjusted empirically to `83 µs` per step to account for TRIAC latching characteristics of the specific module used.

### 3.5 Brightness Limits

To prevent visible flickering caused by unstable TRIAC conduction at very low and very high duty cycles:

```cpp
const int MIN_BRIGHTNESS = 20;  // Below this, TRIAC latching becomes unreliable
const int MAX_BRIGHTNESS = 95;  // Above this, hard-ON is used instead
```

When `dimmerValue >= 95`, `DIM_PIN` is driven HIGH continuously (full conduction, bypassing the phase delay). When `dimmerValue <= 5`, `DIM_PIN` is held LOW (fully off).

---

## 4. ESP32 Firmware

### 4.1 Libraries Used

| Library | Version | Purpose |
|---|---|---|
| `WiFi.h` | Built-in (ESP32 Arduino Core) | Wi-Fi connection |
| `PubSubClient` | Nick O'Leary | MQTT client |
| `ArduinoJson` | Benoit Blanchon | JSON message parsing |

### 4.2 Wi-Fi and MQTT Configuration

```cpp
const char* ssid        = "SLT-Fiber-EYcM6-2.4G";
const char* password    = "aqua1483";
const char* mqtt_server = "192.168.1.187";   // Laptop IP on local network
const char* mqtt_topic  = "waveme/dimmer";
```

The ESP32 connects to the local Wi-Fi network, then establishes a TCP connection to the Mosquitto broker at port 1883. A random client ID (`ESP32Dimmer-XXXX`) is generated on each connection to avoid conflicts.

### 4.3 MQTT Message Format

All commands are JSON objects sent to the `waveme/dimmer` topic:

```json
{"action": "ON"}
{"action": "OFF"}
{"action": "BRIGHTNESS_UP"}
{"action": "BRIGHTNESS_DOWN"}
```

### 4.4 Command Callback Logic

```cpp
void callback(char* topic, byte* payload, unsigned int length) {
    // Parse JSON
    const char* action = doc["action"];

    if      (action == "ON")             dimmerValue = MAX_BRIGHTNESS;
    else if (action == "OFF")            dimmerValue = 0;
    else if (action == "BRIGHTNESS_UP")  dimmerValue = min(dimmerValue + 10, MAX_BRIGHTNESS);
    else if (action == "BRIGHTNESS_DOWN") dimmerValue = max(dimmerValue - 10, MIN_BRIGHTNESS);
}
```

Brightness changes in **10% increments** per command. The `dimmerValue` variable is declared `volatile` because it is written by the main thread (callback) and read by the ISR.

### 4.5 Main Loop

```cpp
void loop() {
    if (!client.connected()) reconnect();
    client.loop();   // Processes incoming MQTT messages and calls callback()
}
```

The loop is intentionally minimal. All time-critical AC control happens inside the ISR, completely independently of the MQTT receive cycle.

---

## 5. MQTT Broker — Mosquitto

### 5.1 Configuration (`mosquitto_waveme.conf`)

```
allow_anonymous true

listener 1883 0.0.0.0       # Raw TCP — for ESP32
listener 9001 0.0.0.0       # WebSockets — for future browser clients
protocol websockets
```

The broker runs on a Windows laptop on the local network. Both the ESP32 and the relay server connect to it simultaneously. The broker routes messages from publisher to subscriber using the topic string `waveme/dimmer`.

### 5.2 Starting the Broker

```bat
"C:\Program Files\mosquitto\mosquitto.exe" -v -c mosquitto_waveme.conf
```

Verified connections in broker logs:
- `ESP32Dimmer-XXXX` — the microcontroller
- `mqttjs_XXXXXXXX` — the Node.js relay server

---

## 6. HTTP-to-MQTT Relay Server

### 6.1 Why a Relay Server

The `mqtt` npm package's WebSocket client is incompatible with React Native's JavaScript runtime (Hermes engine) on Android, causing persistent `client went offline` errors. The relay server solves this by separating concerns:

- React Native uses the native `fetch()` API (HTTP) — fully stable on all platforms
- The relay server (running on the laptop) handles the MQTT WebSocket connection

### 6.2 Architecture

```
Phone App
  │  HTTP POST /command  {"action":"ON"}
  ▼
Node.js HTTP Server (Port 3000)
  │  mqttClient.publish("waveme/dimmer", '{"action":"ON"}')
  ▼
Mosquitto Broker (Port 1883)
  │  delivers to subscriber
  ▼
ESP32
```

### 6.3 Relay Server Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/command` | Accepts `{"action":"..."}`, publishes to MQTT |
| `GET` | `/health` | Returns `{"server": true, "mqtt": true/false}` |

### 6.4 Starting the Relay Server

```bash
cd "E:\ICBT\Final Project\Waveme\iot-stuff"
node mqtt_relay_server.js
```

### 6.5 One-Click Startup Script

Both services can be started together by running `start_iot.bat` from the `iot-stuff` directory. This script kills any existing instances and opens two separate windows for the broker and relay server.

---

## 7. Mobile Application — Gesture-to-Command Pipeline

### 7.1 MediaPipe Gesture Recognition

The application uses a custom native Android module (`MyCameraNativeComponent`) that wraps the **Google MediaPipe Gesture Recognizer** task. The model runs entirely on-device in real time using the phone's camera feed. It outputs:

- A gesture **label** (string): `Open_Palm`, `Closed_Fist`, `Thumb_Up`, `Thumb_Down`, `None`
- A **confidence score** (float, 0.0–1.0)

The native module fires an `onGestureDetected` event to the React Native JavaScript layer on every frame where a gesture is detected.

### 7.2 Confidence Threshold

A minimum confidence of **0.6 (60%)** is enforced before any command is acted upon, reducing false triggers from ambiguous hand positions:

```typescript
if (confidence < 0.6) return;
```

### 7.3 Gesture-to-Action Mapping

| Gesture | Action | Behaviour |
|---|---|---|
| `Open_Palm` | `ON` | Sends a single `ON` command — sets bulb to maximum brightness |
| `Closed_Fist` | `OFF` | Sends a single `OFF` command — turns bulb off |
| `Thumb_Up` | `BRIGHTNESS_UP` | Sends `BRIGHTNESS_UP` immediately, then repeats every 500 ms while gesture is held |
| `Thumb_Down` | `BRIGHTNESS_DOWN` | Sends `BRIGHTNESS_DOWN` immediately, then repeats every 500 ms while gesture is held |
| `None` / any other | — | Stops the brightness repeat timer |

### 7.4 Gesture Deduplication

A `lastGestureRef` stores the most recently processed gesture. If the same gesture label arrives on consecutive frames, no new command is dispatched. This prevents sending dozens of `ON` commands for a single held Open Palm:

```typescript
if (gesture === lastGestureRef.current) return;
lastGestureRef.current = gesture;
```

### 7.5 Continuous Brightness Timer

For thumb gestures, a `setInterval` timer fires every 500 ms and sends a repeated command:

```typescript
brightnessTimerRef.current = setInterval(() => {
    publishCommand(action);   // BRIGHTNESS_UP or BRIGHTNESS_DOWN
}, 500);
```

The timer is cleared as soon as a different gesture is detected or the camera is stopped.

### 7.6 HTTP Command Dispatch

Each command is sent as a JSON HTTP POST to the relay server:

```typescript
await fetch('http://192.168.1.187:3000/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
});
```

The native `fetch()` API is used — no third-party networking library is required in the React Native app.

---

## 8. End-to-End Command Flow Example

**Scenario:** User holds up a Thumbs Up gesture to increase brightness.

```
1. MediaPipe detects "Thumb_Up" with confidence 0.87
2. handleGestureDetected() fires in App.tsx
3. Confidence check passes (0.87 > 0.6)
4. Gesture differs from last ("Thumb_Up" != "None")
5. startBrightnessTimer("BRIGHTNESS_UP") called:
      - Immediately sends HTTP POST {"action":"BRIGHTNESS_UP"}
      - setInterval(500ms) starts
6. Relay server receives POST, calls mqttClient.publish("waveme/dimmer", '{"action":"BRIGHTNESS_UP"}')
7. Mosquitto delivers message to ESP32
8. ESP32 callback() parses JSON: action = "BRIGHTNESS_UP"
9. dimmerValue += 10  (e.g. 50 → 60)
10. Next zero-crossing ISR executes:
       delayTime = (100 - 60) * 83 = 3320 µs
       Wait 3320 µs after ZC, then trigger TRIAC for 20 µs
11. Bulb conducts for ~60% of each half-cycle → brighter
12. After 500 ms, timer fires again → dimmerValue = 70 → brighter still
13. User lowers hand → gesture = "None" → timer cleared → brightness holds
```

---

## 9. Development Challenges and Solutions

| Challenge | Root Cause | Solution |
|---|---|---|
| `esp_intr.h` not found | `RBDDimmer` library incompatible with ESP32 Arduino Core 3.x | Replaced with manual ISR using `delayMicroseconds()` |
| Bulb only lit at 99%, no dimming | `timerAlarmWrite` API removed in Core 3.x | Switched from hardware timer to `delayMicroseconds()` directly in ISR |
| Bulb flickering at low brightness | Electrical noise producing false zero-crossing pulses | Added 7 ms blanking window in ISR |
| MQTT `client went offline` on Android | `mqtt` npm package WebSocket incompatibility with Hermes JS engine | Introduced Node.js HTTP-to-MQTT relay server; app uses `fetch()` |
| Windows Firewall blocking port 3000 | Default inbound block policy | Added explicit inbound rule via `New-NetFirewallRule` (Admin PowerShell) |

---

## 10. File Reference

| File | Description |
|---|---|
| `App.tsx` | React Native app — gesture detection, HTTP dispatch, UI |
| `iot-stuff/esp32_dimmer_mqtt.ino` | ESP32 firmware — Wi-Fi, MQTT, phase-angle dimming |
| `iot-stuff/mqtt_relay_server.js` | Node.js relay — bridges HTTP (phone) to MQTT (broker) |
| `iot-stuff/mosquitto_waveme.conf` | Mosquitto broker configuration |
| `iot-stuff/start_iot.bat` | One-click script to start broker + relay server |
| `iot-stuff/dimmer_test_v3.ino` | Standalone dimmer test (no Wi-Fi) — used for hardware validation |
