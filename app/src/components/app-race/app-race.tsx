import { Component, Prop, h, State } from '@stencil/core';
import { Race, RacesService, Rider } from '../../services/races.service';
import { MatchResults, RouterHistory } from '@stencil/router';

declare const io;

@Component({
  tag: 'app-race',
  styleUrl: 'app-race.css',
})
export class AppRace {
  @Prop() history: RouterHistory;
  @Prop() match: MatchResults;
  @State() race: Race;

  stagesMap: { [stageId: string]: string; };
  ridersMap: { [riderId: string]: string; };

  private racesService = new RacesService();

  private socket: any;

  componentWillLoad() {
    return this.racesService.getRace(this.match.params.id)
      .then(race => {
        if (race != null) {
          this.race = race;
          this.ridersMap = race.riders.map(r => ({ [r.id]: r.name })).reduce((p, c) => ({ ...p, ...c }), {});
          this.stagesMap = race.stages.map(s => ({ [s.id]: s.name })).reduce((p, c) => ({ ...p, ...c }), {});
        } else {
          this.history.push('/');
        }
      });
  }

  componentDidLoad() {
    this.socket = io('http://localhost:3000');

    this.socket.on('waitforstart', (msg) => {
      const raceUpdate = JSON.parse(msg);
      this.racesService.getRace(raceUpdate.raceId)
        .then(race => {
          if (race != null) {
            this.race = race;
          }
        });
    });

    this.socket.on('letsstart', (msg) => {
      const raceUpdate = JSON.parse(msg);
      this.racesService.getRace(raceUpdate.raceId)
        .then(race => {
          if (race != null) {
            this.race = race;
          }
        });
    });

    this.socket.on('ontrack', (msg) => {
      const raceUpdate = JSON.parse(msg);
      this.racesService.getRace(raceUpdate.raceId)
        .then(race => {
          if (race != null) {
            this.race = race;
          }
        });
    });

    this.socket.on('stopped', (msg) => {
      const raceUpdate = JSON.parse(msg);
      this.racesService.getRace(raceUpdate.raceId)
        .then(race => {
          if (race != null) {
            this.race = race;
          }
        });
    });
  }

  next() {
    const raceId = this.race.id;
    const currentStageId = this.race.currentStageId;
    const stageIndex = this.race.stages.findIndex(s => s.id === currentStageId);
    if (stageIndex !== -1) {
      const nextStageIndex = stageIndex + 1;
      if (nextStageIndex < this.race.stages.length) {
        const nextStage = this.race.stages[nextStageIndex];
        this.racesService.nextStage(raceId, nextStage.id).then(race => {
          if (race != null) {
            this.race = race;
          }
        })
      } else {
        this.history.push(`/results/${raceId}`);
      }
    }
  }

  onPrepare(raceId: string, rider: Rider) {
    const msg = {
      raceId,
      rider
    };
    this.socket.emit('wannastart', JSON.stringify(msg));
  }

  onStart(raceId: string, rider: Rider) {
    const msg = {
      raceId,
      rider,
      start: new Date().getTime()
    };
    this.socket.emit('start', JSON.stringify(msg));
  }

  onStop(raceId: string, rider: Rider) {
    const msg = {
      raceId,
      rider,
      stop: new Date().getTime()
    };
    this.socket.emit('stop', JSON.stringify(msg));
  }

  render() {
    if (this.race == null) return null;

    const currentStageState = this.race.state[this.race.currentStageId];
    let disabled = false;
    for (const key in currentStageState.state) {
      if (currentStageState.state.hasOwnProperty(key)) {
        const element = currentStageState.state[key];
        if (element.state !== 'done') {
          disabled = true;
          break;
        }
      }
    }
    const filtered = currentStageState.riders.filter(r => currentStageState.state[r.id].state !== 'done');
    const done = currentStageState.riders.filter(r => currentStageState.state[r.id].state === 'done');
    return (
      <div class="app-race">
        <h1>{this.race.name}</h1>
        <h2>{this.stagesMap[this.race.currentStageId]} ({this.race.stages.findIndex(s => s.id === this.race.currentStageId) + 1}/{this.race.stages.length})</h2>
        <h3>Running Order</h3>
        {
          filtered.length === 0
          ? <p>All riders finished. Hit <strong>NEXT</strong> to go to the next stage or see the results.</p>
          : <div class="rider-list">
            {
              filtered.map(r =>
                <div class="rider-item-group">
                  <div class={'rider-item ' + currentStageState.state[r.id].state}>
                    <div class="rider-name">{r.name}</div>
                    <div class="rider-state">
                      { (currentStageState.state[r.id].state === 'idle'&& filtered[0].id === r.id) && <span>Click <strong>PREPARE</strong> and you'll have {this.race.waitTime / 1000}s time left till start</span> }
                      { currentStageState.state[r.id].state === 'waitforstart' && <span>Prepare yourself ...</span> }
                      { currentStageState.state[r.id].state === 'letsstart' && <span>Hit start and good luck!</span> }
                      { currentStageState.state[r.id].state === 'ontrack' && <span>Rider's on track! Hammering 🔨</span> }
                    </div>
                    <div class="rider-actions">
                      {
                        currentStageState.state[r.id].state === 'idle' &&
                        filtered[0].id === r.id
                        ? <button class="btn-sm" onClick={() => this.onPrepare(this.race.id, r)}>Prepare</button>
                        : null
                      }
                      {
                        currentStageState.state[r.id].state === 'letsstart'
                        ? <button class="btn-sm" onClick={() => this.onStart(this.race.id, r)}>Start</button>
                        : null
                      }
                      {
                        currentStageState.state[r.id].state === 'ontrack'
                        ? <button class="btn-sm" onClick={() => this.onStop(this.race.id, r)}>Stop</button>
                        : null
                      }
                    </div>
                  </div>
                </div>
              )
          }
          </div>
        }
        <h3>Finished</h3>
        { done.length === 0
          ? <p>No rider has finished yet.</p>
          :
          <div class="rider-list">
          {
            done.map(r =>
              <div class="rider-item-group">
                <div class="rider-item done">
                  <div class="rider-name">{r.name}</div>
                </div>
              </div>
            )
          }
          </div>
        }
        <div class="next-stage">
          <button disabled={disabled} onClick={() => this.next()}>Next</button>
        </div>
      </div>
    );
  }
}
