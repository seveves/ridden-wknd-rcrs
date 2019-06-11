const express = require('express');
const shortid = require('shortid');

function raceRouter(races) {
  const router = express.Router();
  
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const race = races.findOne({ id });
    if (!race) {
      res.status(404).json();
    } else {
      res.json(race);
    }
  });

  router.post('/', (req, res) => {
    const id = shortid.generate();
    const race = { id, ...req.body };
    res.json(races.insert(race));
  });

  router.put('/next/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const race = races.findOne({ id });
    race.currentStageId = body.stageId;
    return res.json(races.update(race));
  });

  router.get('/results/:id', (req, res) => {
    const id = req.params.id;
    const race = races.findOne({ id });
    if (!race) {
      res.status(404).json();
    } else {
      const raceState = race.state;
      const overall = [];
      const stageResults = {};
      for (const stageId in raceState) {
        if (raceState.hasOwnProperty(stageId)) {
          const stage = raceState[stageId];
          const stageState = stage.state;
          for (const riderId in stageState) {
            if (stageState.hasOwnProperty(riderId)) {
              const riderState = stageState[riderId];
              if (riderState.start != null && riderState.stop != null) {
                const bonusTime =
                  stage.riders[0].id === riderId ||
                  stage.riders[stage.riders.length - 1] === riderId
                    ? race.bonusTime
                    : 0;
                const stageTime = riderState.stop - riderState.start - bonusTime;
                const rider = race.riders.find(r => r.id === riderId);
                if (rider != null) {
                  if (stageResults[stageId] == null) {
                    stageResults[stageId] = [{ rider, stageTime }];
                  } else {
                    stageResults[stageId].push({ rider, stageTime });
                  }

                  const i = overall.findIndex(o => o.rider.id === riderId);
                  if (i !== -1) {
                    overall[i].overallTime += stageTime
                  } else {
                    overall.push({
                      rider,
                      overallTime: stageTime
                    })
                  };
                }
              }
            }
          }
        }
      }
      for (const stage in stageResults) {
        if (stageResults.hasOwnProperty(stage)) {
          stageResults[stage].sort((a, b) => a.stageTime - b.stageTime);
        }
      }
      overall.sort((a, b) => a.overallTime - b.overallTime);
      res.json({
        raceId: id,
        raceName: race.name,
        stages: race.stages,
        stageResults,
        overall
      });
    }
  });

  return router;
}

module.exports = raceRouter;