#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "WIFI_NOMI";
const char* password = "WIFI_PAROLI";

// Masalan: https://192.168.1.10:3443
const char* serverUrl = "https://SERVER_IP:3443";

const int IN1 = 27;
const int IN2 = 14;
const int IN3 = 32;
const int IN4 = 33;

unsigned long lastCheck = 0;
const unsigned long checkInterval = 500;
WiFiClientSecure secureClient;

void oldinga() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void orqaga() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void chapga() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void ongga() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void toxta() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

String extractCommand(String payload) {
  if (payload.indexOf("oldinga") >= 0) return "oldinga";
  if (payload.indexOf("orqaga") >= 0) return "orqaga";
  if (payload.indexOf("chapga") >= 0) return "chapga";
  if (payload.indexOf("ongga") >= 0) return "ongga";
  if (payload.indexOf("toxta") >= 0) return "toxta";
  return "";
}

void clearCommand() {
  HTTPClient http;
  String url = String(serverUrl) + "/clear";
  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");
  http.POST("{}");
  http.end();
}

void runCommand(String command) {
  if (command == "oldinga") oldinga();
  else if (command == "orqaga") orqaga();
  else if (command == "chapga") chapga();
  else if (command == "ongga") ongga();
  else if (command == "toxta") toxta();
}

void checkCommand() {
  HTTPClient http;
  String url = String(serverUrl) + "/command";

  http.begin(secureClient, url);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    String command = extractCommand(payload);

    if (command.length() > 0) {
      Serial.println("Command: " + command);
      runCommand(command);
      clearCommand();
    }
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  secureClient.setInsecure();

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  toxta();

  WiFi.begin(ssid, password);
  Serial.print("WiFi ulanmoqda");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi ulandi");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED && millis() - lastCheck >= checkInterval) {
    lastCheck = millis();
    checkCommand();
  }
}
