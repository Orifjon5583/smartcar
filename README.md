# Robot Mashina Ovozli Boshqaruv

Node.js + Express + HTTPS + HTML/CSS/JS orqali telefon brauzeridan ESP32 robot mashinani boshqarish loyihasi.

## Ishga tushirish

```bash
npm install
npm run cert
npm start
```

Server HTTPS orqali ishlaydi:

```text
https://localhost:3443
```

Telefon orqali kirish uchun kompyuterning WiFi IP manzilini toping va shunday oching:

```text
https://KOMPYUTER_IP:3443
```

Self-signed sertifikat ishlatilgani uchun brauzer birinchi kirishda ogohlantirish chiqarishi mumkin. Davom etishni tanlang, aks holda telefon mikrofoni ishlamaydi.

## API

- `GET /` - sayt
- `POST /command` - buyruq yuborish
- `GET /command` - ESP32 oxirgi buyruqni oladi
- `POST /clear` - buyruqni tozalaydi

`GET /command` javobi:

```json
{ "command": "oldinga" }
```

## Buyruqlar

- `oldinga`
- `orqaga`
- `chapga`
- `ongga`
- `toxta`

Sayt ovozda `o'ngga` va `to'xta` variantlarini ham taniydi.

## ESP32

`esp32_robot_car.ino` faylida quyidagilarni o'zgartiring:

```cpp
const char* ssid = "WIFI_NOMI";
const char* password = "WIFI_PAROLI";
const char* serverUrl = "https://SERVER_IP:3443";
```

ESP32 har 500ms da `/command` ni tekshiradi, buyruqni bajaradi va keyin `/clear` ga POST yuboradi.
