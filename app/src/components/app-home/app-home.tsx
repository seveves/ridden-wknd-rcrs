import { Component, h, State, Prop } from '@stencil/core';
import { Rider, Stage, Race, RacesService, StageState } from '../../services/races.service';
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {
  @Prop() history: RouterHistory;
  @State() riders: Rider[] = [];
  @State() stages: Stage[] = [];
  @State() bonusTime = 5000;
  @State() waitTime = 10000;
  @State() name = 'Weekend Race';

  private racesService = new RacesService();

  handleSubmit(ev) {
    ev.preventDefault();
    if (this.riders.length > 0 && this.stages.length > 0) {
      const race: Race = {
        name: this.name,
        riders: this.riders,
        stages: this.stages,
        bonusTime: this.bonusTime,
        waitTime: this.waitTime,
        currentStageId: this.stages[0].id,
        state: this.stages.map(s => ({
          [s.id]: {
            riders: this.shuffle(this.riders),
            state: this.riders.map(r => ({
              [r.id]: {
                state: 'idle',
              }
            } as StageState)).reduce((p, c) => ({ ...p, ...c}), {})
          }
        })).reduce((p, c) => ({ ...p, ...c }), {})
      };
      this.racesService.createRace(race)
        .then((r) => this.history.push(`/race/${r.id}`));
    }
  }

  handleNameChange(ev) {
    ev.preventDefault();
    this.name = ev.target.value;
  }

  handleBonusTimeChange(ev) {
    ev.preventDefault();
    this.bonusTime = +ev.target.value * 1000;
  }

  handleWaitTimeChange(ev) {
    ev.preventDefault();
    this.waitTime = +ev.target.value * 1000;
  }

  handleRiderChange(ev, riderId: string) {
    ev.preventDefault();
    const index = this.riders.findIndex(r => r.id === riderId);
    if (index !== -1) {
      this.riders = [
        ...this.riders.slice(0, index),
        {
          ...this.riders[index],
          name: ev.target.value
        },
        ...this.riders.slice(index + 1)
      ];
    }
  }

  handleStageChange(ev, stageId: string) {
    ev.preventDefault();
    const index = this.stages.findIndex(r => r.id === stageId);
    if (index !== -1) {
      this.stages = [
        ...this.stages.slice(0, index),
        {
          ...this.stages[index],
          name: ev.target.value
        },
        ...this.stages.slice(index + 1)
      ];
    }
  }

  addEmptyRider(ev) {
    ev.preventDefault();
    this.riders = [
      ...this.riders,
      {
        id: this.generateShortId(),
        name: ''
      }
    ];
  }

  addEmptyStage(ev) {
    ev.preventDefault();
    this.stages = [
      ...this.stages,
      {
        id: this.generateShortId(),
        name: `Stage ${this.stages.length + 1}`
      }
    ];
  }

  render() {
    return (
      <div class="app-home">
        <p class="jumbo">
          <strong>Hey, Weekend Racer 🗿</strong><br/><br/>
          Wanna start a new race with your buddies?<br/>
          Just add riders and stages and we're ready to do so.
        </p>

        <form>
          <div class="form-group">
            <div class="form-control">
              <label>First of all, give your race a funny name 🤡</label>
              <input type="text" value={this.name} onInput={(ev) => this.handleNameChange(ev)} />
            </div>
            <p class="mt">
              Now let's add those guys that are silly enough to do a race with you.<br/>
              Just click on <strong>ADD RIDER</strong> and enter a name or alias for your buddies.
            </p>
            <div class="form-header">
              <h3>Riders</h3>
              <button class="btn-sm" onClick={(ev) => this.addEmptyRider(ev)}>Add Rider</button>
            </div>
            {this.riders.length === 0 && <p>
              No riders added yet.<br/>
              Of course you can ride alone but in my humble opinion three makes a race 🎉
            </p>}
            {this.riders.map(r => (
              <div class="form-control">
                <input
                  type="text"
                  value={r.name}
                  onInput={(ev) => this.handleRiderChange(ev, r.id)}
                />
              </div>
            ))}
          </div>
          <p class="mt">
            How many stages do you guys wanna rip?<br/>
            Click the <strong>ADD STAGES</strong> button, name it and you're good to go.
          </p>
          <div class="form-group">
            <div class="form-header">
              <h3>Stages</h3>
              <button class="btn-sm" onClick={(ev) => this.addEmptyStage(ev)}>Add Stage</button>
            </div>
            {this.stages.length === 0 && <p>No stages added yet. We need at least one to start 🏁</p>}
            {this.stages.map(s => (
              <div class="form-control">
                <input
                  type="text"
                  value={s.name}
                  onInput={(ev) => this.handleStageChange(ev, s.id)}
                />
              </div>
            ))}
          </div>

          <div class="form-group">
            <div class="form-header">
              <h3>Settings</h3>
            </div>
            <div class="form-control">
              <label>Bonus time  the first and the last rider (in seconds) because they have to stop or start the stopwatch on their own.</label>
              <input type="number" value={this.bonusTime / 1000} onInput={(ev) => this.handleBonusTimeChange(ev)} />
            </div>
            <div class="form-control">
              <label>Wait time between riders (in seconds) that is used for preparation. Like building mental strength or having that last important wee.</label>
              <input type="number" value={this.waitTime / 1000 } onInput={(ev) => this.handleWaitTimeChange(ev)} />
            </div>
          </div>
          
          <p class="mt">
            If everything looks good then hit <strong>CREATE</strong> and send it 🤙
          </p>
          <div class="form-group text-right">
            <button disabled={this.riders.length === 0 || this.stages.length === 0} onClick={(ev) => this.handleSubmit(ev)}>Create</button>
          </div>
        </form>
      </div>
    );
  }

  private generateShortId(): string {
    return (
      '0000' + ((Math.random() * Math.pow(36, 4)) | 0).toString(36)
    ).slice(-4);
  }

  private shuffle<T>(items: T[]) {
    const shuffled = items.map(i => ({ ...i }));
    let currentIndex = shuffled.length;
    let temporaryValue: T;
    let randomIndex: number;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  }
}
