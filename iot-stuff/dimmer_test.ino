// ESP32 Dimmer Test Code
// This code will cycle the brightness from 0% to 100% repeatedly.

// Hardware Pinout
const int ZC_PIN = 12; // D12 (Zero Crossing)
const int DIM_PIN = 13; // D13 (Dimmer Control)

volatile int dimmerValue = 0; // 0 to 100
unsigned long lastUpdate = 0;
bool increasing = true;

// Interrupt function for Zero Crossing
void IRAM_ATTR handleZeroCrossing() {
  if (dimmerValue <= 0) {
    digitalWrite(DIM_PIN, LOW);
    return;
  }
  if (dimmerValue >= 100) {
    digitalWrite(DIM_PIN, HIGH);
    return;
  }

  // Calculate delay (AC is 50Hz, so 10ms per half cycle)
  // 10000us / 100 steps = 100us per step
  int delayTime = (100 - dimmerValue) * 100; 
  delayMicroseconds(delayTime);
  digitalWrite(DIM_PIN, HIGH);
  delayMicroseconds(10); // Pulse width
  digitalWrite(DIM_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  Serial.println("Dimmer Test Starting...");
  
  pinMode(ZC_PIN, INPUT_PULLUP);
  pinMode(DIM_PIN, OUTPUT);
  digitalWrite(DIM_PIN, LOW);

  // Attach interrupt to Zero Crossing pin
  attachInterrupt(digitalPinToInterrupt(ZC_PIN), handleZeroCrossing, RISING);
}

void loop() {
  // Update brightness every 50ms for a smooth fade
  if (millis() - lastUpdate > 50) {
    lastUpdate = millis();
    
    if (increasing) {
      dimmerValue++;
      if (dimmerValue >= 100) {
        increasing = false; // Start decreasing once full brightness is reached
        Serial.println("Reached 100%, now decreasing...");
      }
    } else {
      dimmerValue--;
      if (dimmerValue <= 0) {
        increasing = true; // Start increasing once off
        Serial.println("Reached 0%, now increasing...");
      }
    }
    
    // Optional: Print current brightness to Serial Monitor
    if (dimmerValue % 10 == 0) {
      Serial.print("Current Brightness: ");
      Serial.print(dimmerValue);
      Serial.println("%");
    }
  }
}
