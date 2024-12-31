import { BeamSearchStrategy } from './beam-search.js';
import { MonteCarloTreeSearchStrategy } from './mcts.js';
export var ReasoningStrategy;
(function (ReasoningStrategy) {
    ReasoningStrategy["BEAM_SEARCH"] = "beam_search";
    ReasoningStrategy["MCTS"] = "mcts";
})(ReasoningStrategy || (ReasoningStrategy = {}));
export class StrategyFactory {
    static createStrategy(type, stateManager) {
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
