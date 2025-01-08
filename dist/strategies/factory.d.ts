import { StateManager } from '../state.js';
import { BaseStrategy } from './base.js';
export declare enum ReasoningStrategy {
    BEAM_SEARCH = "beam_search",
    MCTS = "mcts",
    MCTS_002_ALPHA = "mcts_002_alpha",
    MCTS_002_ALT_ALPHA = "mcts_002_alt_alpha"
}
export declare class StrategyFactory {
    static createStrategy(type: ReasoningStrategy, stateManager: StateManager, beamWidth?: number, numSimulations?: number): BaseStrategy;
}
