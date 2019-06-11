const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const loki = require('lokijs');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const server = http.Server(app);
const io = isProduction
  ? socketio(server)
  : socketio(server, {
    log: false,
    agent: false,
    origins: '*:*',
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
  });
const db = new loki();
const races = db.addCollection('races', { indices: 'id' });
const raceRouter = require('./routes/race');
const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
  socket.on('wannastart', (msg) => {
    const raceUpdate = JSON.parse(msg);
    const race = updateCurrentStageRider(msg, raceUpdate.raceId, raceUpdate.rider.id, { state: 'waitforstart' });
    if (race != null) {
      io.emit('waitforstart', msg);
    }

    setTimeout(() => {
      const race = updateCurrentStageRider(msg, raceUpdate.raceId, raceUpdate.rider.id, { state: 'letsstart' });
      if (race != null) {
        io.emit('letsstart', msg);
      }
    }, race.waitTime);
  });

  socket.on('start', (msg) => {
    const raceUpdate = JSON.parse(msg);
    const race = updateCurrentStageRider(msg, raceUpdate.raceId, raceUpdate.rider.id, { state: 'ontrack', start: raceUpdate.start });
      if (race != null) {
        io.emit('ontrack', msg);
      }
  });

  socket.on('stop', (msg) => {
    const raceUpdate = JSON.parse(msg);
    const race = updateCurrentStageRider(msg, raceUpdate.raceId, raceUpdate.rider.id, { state: 'done', stop: raceUpdate.stop });
      if (race != null) {
        io.emit('stopped', msg);
      }
  });
});

if (!isProduction) {
  app.use(require('cors')({ origin: '*' }));
}
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'app', 'www')));
app.use('/api/races', raceRouter(races));

app.get('*', (req, res) =>
  res.sendFile(path.resolve(__dirname, 'app', 'www', 'index.html'))
);

const fiveDays = 1000 * 60 * 60 * 24 * 5;
setInterval(() => {
  const olderThanFiveDays = new Date().getTime() - fiveDays;
  const toRemove = items.find({ 'meta.created': { '$lt': olderThanFiveDays }});
  races.remove(toRemove);
  console.log(`[RDDN WKND RCRS] removing old races ${toRemove.map(t => t.id).join(',')}`);
}, fiveDays) 

server.listen(port, () => {
  console.log(`[RDDN WKND RCRS] up and running on port ${port} (Production: ${isProduction})`);
});

function updateCurrentStageRider(msg, raceId, riderId, riderState) {
  const race = races.findOne({ id: raceId });
  if (race != null) {
    race.state[race.currentStageId].state[riderId] = {
      ...race.state[race.currentStageId].state[riderId],
      ...riderState
    }
    return races.update(race);
  }
  return null;
}
