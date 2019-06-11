export interface Rider {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  name: string;
}

export interface RiderStageState {
  state: 'idle' | 'waitforstart' | 'letsstart' | 'ontrack' | 'done';
  start?: number;
  stop?: number;
}

export interface StageState {
  [riderId: string]: RiderStageState;
}

export interface Race {
  id?: string;
  name: string;
  riders: Rider[];
  stages: Stage[];
  bonusTime: number;
  waitTime: number;
  currentStageId: string;
  state: {
    [stageId: string]: {
      riders: Rider[];
      state: StageState;
    };
  },
  meta?: {
    created: number;
    updated: number;
    version: number;
    revision: number;
  }
}

export interface RaceResult {
  raceId: string;
  raceName: string;
  stages: Stage[];
  stageResults: {
    [stageId: string]: { rider: Rider; stageTime: number; }[];
  },
  overall: { rider: Rider; overallTime: number; }[];
}

export class RacesService {

  BASE_URL = '/api/races';

  async getRace(id: string): Promise<Race> {
    try {
      const res = await fetch(`${this.BASE_URL}/${id}`);
      return await res.json();
    }
    catch (err) {
      console.log('getRace', err);
      return null;
    }
  }

  async createRace(race: Race): Promise<Race> {
    try {
      const res = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(race)
      })
      return await res.json();
    }
    catch (err) {
      console.log('createRace', err);
      return null;
    }
  }

  async nextStage(id: string, stageId: string): Promise<Race> {
    try {
      const res = await fetch(`${this.BASE_URL}/next/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stageId })
      })
      return await res.json();
    }
    catch (err) {
      console.log('nextStage', err);
      return null;
    }
  }

  async getResults(id: string): Promise<RaceResult> {
    try {
      const res = await fetch(`${this.BASE_URL}/results/${id}`);
      return await res.json();
    }
    catch (err) {
      console.log('getResults', err);
      return null;
    }
  }
}