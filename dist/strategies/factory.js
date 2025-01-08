import { BeamSearchStrategy } from './beam-search.js';
import { MonteCarloTreeSearchStrategy } from './mcts.js';
import { MCTS002AlphaStrategy } from './experiments/mcts-002-alpha.js';
import { MCTS002AltAlphaStrategy } from './experiments/mcts-002alt-alpha.js';
export var ReasoningStrategy;
(function (ReasoningStrategy) {
    ReasoningStrategy["BEAM_SEARCH"] = "beam_search";
    ReasoningStrategy["MCTS"] = "mcts";
    ReasoningStrategy["MCTS_002_ALPHA"] = "mcts_002_alpha";
    ReasoningStrategy["MCTS_002_ALT_ALPHA"] = "mcts_002_alt_alpha";
})(ReasoningStrategy || (ReasoningStrategy = {}));
export class StrategyFactory {
    static createStrategy(type, stateManager, beamWidth, numSimulations) {
        switch (type) {
            case ReasoningStrategy.BEAM_SEARCH:
                return new BeamSearchStrategy(stateManager, beamWidth);
            case ReasoningStrategy.MCTS:
                return new MonteCarloTreeSearchStrategy(stateManager, numSimulations);
            case ReasoningStrategy.MCTS_002_ALPHA:
                return new MCTS002AlphaStrategy(stateManager, numSimulations);
            case ReasoningStrategy.MCTS_002_ALT_ALPHA:
                return new MCTS002AltAlphaStrategy(stateManager, numSimulations);
            default:
                throw new Error(`Unknown strategy type: ${type}`);
        }
    }
}
