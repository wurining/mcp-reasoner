import { StateManager } from '../state.js';
import { BaseStrategy } from './base.js';
import { BeamSearchStrategy } from './beam-search.js';
import { MonteCarloTreeSearchStrategy } from './mcts.js';

export enum ReasoningStrategy {
  BEAM_SEARCH = 'beam_search',
  MCTS = 'mcts'
}

export class StrategyFactory {
  static createStrategy(
    type: ReasoningStrategy,
    stateManager: StateManager
  ): BaseStrategy {
    switch (type) {
      case ReasoningStrategy.BEAM_SEARCH:
        return new BeamSearchStrategy(stateManager);
      case ReasoningStrategy.MCTS:
        return new MonteCarloTreeSearchStrategy(stateManager);
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }
}
