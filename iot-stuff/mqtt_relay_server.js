const http = require('http');
const mqtt = require('mqtt');

const MQTT_BROKER = 'mqtt://127.0.0.1:1883';
const MQTT_TOPIC = 'waveme/dimmer';
const HTTP_PORT = 3000;

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('[MQTT] Connected to broker at', MQTT_BROKER);
});

mqttClient.on('error', (err) => {
  console.error('[MQTT] Error:', err.message);
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/command') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const message = JSON.stringify({ action: data.action });
        mqttClient.publish(MQTT_TOPIC, message);
        console.log('[HTTP -> MQTT] Published:', message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: data.action }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      mqtt: mqttClient.connected,
      server: true
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`[HTTP] Relay server running on http://0.0.0.0:${HTTP_PORT}`);
  console.log(`[HTTP] Send POST to http://YOUR_IP:${HTTP_PORT}/command`);
  console.log('[HTTP] Body: {"action": "ON" | "OFF" | "BRIGHTNESS_UP" | "BRIGHTNESS_DOWN"}');
});
