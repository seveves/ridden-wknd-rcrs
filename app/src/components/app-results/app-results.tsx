import { Component, Prop, h, State } from '@stencil/core';
import { RacesService, RaceResult } from '../../services/races.service';
import { MatchResults, RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-results',
  styleUrl: 'app-results.css',
})
export class AppRace {
  @Prop() history: RouterHistory;
  @Prop() match: MatchResults;
  @State() result: RaceResult;

  private racesService = new RacesService();

  componentWillLoad() {
    return this.racesService.getResults(this.match.params.id)
      .then(result => {
        if (result != null) {
          this.result = result;
        } else {
          this.history.push('/');
        }
      });
  }

  render() {
    return (
      <div class="app-results">
        <h1>{this.result.raceName}</h1>
        <h2>Stages</h2>
        {
          this.result.stages.map(s => 
            <div class="stage-results">
              <h3>{s.name}</h3>
              <ol>
                  {this.result.stageResults[s.id].map((r, i) => 
                    <li>
                      <div class="result">
                        <div class="rider-name">{r.rider.name} {i === 0 && '🔥'}</div>
                        <div class="rider-offset">{i > 0 && `+${(r.stageTime - this.result.stageResults[s.id][0].stageTime) / 1000}`}</div>
                        <div class="rider-time">{r.stageTime / 1000}</div>
                      </div>
                    </li>
                  )}
              </ol>
            </div>
          )
        }
        <h2>Overall</h2>
        <div class="overall-results">
          <ol>
            {
              this.result.overall.map((o, i) => 
                <li>
                  <div class="result">
                    <div class="rider-name">{o.rider.name} {i === 0 && '🏆'}</div>
                    <div class="rider-offset">{i > 0 && `+${(o.overallTime - this.result.overall[0].overallTime) / 1000}`}</div>
                    <div class="rider-time">{o.overallTime / 1000}</div>
                  </div>
                </li>
              )
            }
          </ol>
        </div>
      </div>
    );
  }
}
