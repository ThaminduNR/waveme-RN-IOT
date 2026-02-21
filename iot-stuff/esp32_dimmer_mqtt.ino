#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "SLT-Fiber-EYcM6-2.4G";
const char* password = "aqua1483";

// MQTT Configuration
const char* mqtt_server = "192.168.1.187"; 
const char* mqtt_topic = "waveme/dimmer";

// Hardware Pinout
const int ZC_PIN = 12; // D12
const int DIM_PIN = 13; // D13

// Dimming Limits to avoid flickering
const int MIN_BRIGHTNESS = 20; 
const int MAX_BRIGHTNESS = 95;

WiFiClient espClient;
PubSubClient client(espClient);

volatile int dimmerValue = 0; // 0 (OFF) or MIN_BRIGHTNESS to MAX_BRIGHTNESS

// Interrupt function for Zero Crossing (Noise-Filtered & Stable)
void IRAM_ATTR handleZeroCrossing() {
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = micros();
  
  // Noise Filter: Ignore pulses within 7ms of the last one (for 50Hz AC)
  if (interrupt_time - last_interrupt_time < 7000) return; 
  last_interrupt_time = interrupt_time;

  if (dimmerValue <= 5) {
    digitalWrite(DIM_PIN, LOW);
    return;
  }
  if (dimmerValue >= 95) {
    digitalWrite(DIM_PIN, HIGH);
    return;
  }

  // Phase-angle control using delayMicroseconds
  // 10000us is one half-cycle at 50Hz. 83us per step gives ~8300us max delay.
  int delayTime = (100 - dimmerValue) * 83; 
  delayMicroseconds(delayTime);
  digitalWrite(DIM_PIN, HIGH);
  delayMicroseconds(20); // Trigger pulse width
  digitalWrite(DIM_PIN, LOW);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) return;

  const char* action = doc["action"];

  if (strcmp(action, "ON") == 0) {
    dimmerValue = MAX_BRIGHTNESS;
  } else if (strcmp(action, "OFF") == 0) {
    dimmerValue = 0;
  } else if (strcmp(action, "BRIGHTNESS_UP") == 0) {
    if (dimmerValue == 0) dimmerValue = MIN_BRIGHTNESS;
    else dimmerValue += 10;
    if (dimmerValue > MAX_BRIGHTNESS) dimmerValue = MAX_BRIGHTNESS;
  } else if (strcmp(action, "BRIGHTNESS_DOWN") == 0) {
    dimmerValue -= 10;
    if (dimmerValue < MIN_BRIGHTNESS) dimmerValue = MIN_BRIGHTNESS; 
  }
  
  Serial.print("New Brightness: ");
  Serial.print(dimmerValue);
  Serial.println("%");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Dimmer-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(ZC_PIN, INPUT); 
  pinMode(DIM_PIN, OUTPUT);
  digitalWrite(DIM_PIN, LOW);

  // Attach the working noise-filtered interrupt
  attachInterrupt(digitalPinToInterrupt(ZC_PIN), handleZeroCrossing, RISING);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
