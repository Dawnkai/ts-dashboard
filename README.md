# ThingSpeak Dashboard

Dashboard for ThingSpeak measurements in React + Typescript.

### Installation

Install backend requirements:
```bash
pip install -r requirements.txt
```

Install frontend requirements:
```bash
npm install
```

### Running

Create the user database:
```bash
npm run server:db
```

Run backend:
```bash
# Normal mode
npm run server:start
# Hot reload mode (refresh on changes)
npm run server:debug
```

Run frontend:
```bash
npm start
```

Frontend availiable here: http://localhost:1234

Backend available here: http://localhost:5000

Website protected using JWT tokens + refresh: https://flask-jwt-extended.readthedocs.io/en/stable/refreshing_tokens.html

The Things Network API endpoints description:
https://www.mathworks.com/help/thingspeak/rest-api.html?s_tid=CRUX_lftnav

Design inspired by:
https://dribbble.com/shots/20354298-IoT-Dashboard
