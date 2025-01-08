import { CONFIG } from './types.js';
import { StateManager } from './state.js';
import { StrategyFactory, ReasoningStrategy } from './strategies/factory.js';
export class Reasoner {
    constructor() {
        this.stateManager = new StateManager(CONFIG.cacheSize);
        // Initialize available strategies
        this.strategies = new Map();
        // Initialize base strategies
        this.strategies.set(ReasoningStrategy.BEAM_SEARCH, StrategyFactory.createStrategy(ReasoningStrategy.BEAM_SEARCH, this.stateManager, CONFIG.beamWidth));
        this.strategies.set(ReasoningStrategy.MCTS, StrategyFactory.createStrategy(ReasoningStrategy.MCTS, this.stateManager, undefined, CONFIG.numSimulations));
        // Initialize experimental MCTS strategies
        this.strategies.set(ReasoningStrategy.MCTS_002_ALPHA, StrategyFactory.createStrategy(ReasoningStrategy.MCTS_002_ALPHA, this.stateManager, undefined, CONFIG.numSimulations));
        this.strategies.set(ReasoningStrategy.MCTS_002_ALT_ALPHA, StrategyFactory.createStrategy(ReasoningStrategy.MCTS_002_ALT_ALPHA, this.stateManager, undefined, CONFIG.numSimulations));
        // Set default strategy
        const defaultStrategy = CONFIG.defaultStrategy;
        this.currentStrategy = this.strategies.get(defaultStrategy) ||
            this.strategies.get(ReasoningStrategy.BEAM_SEARCH);
    }
    async processThought(request) {
        // Switch strategy if requested
        if (request.strategyType && this.strategies.has(request.strategyType)) {
            const strategyType = request.strategyType;
            // Create new strategy instance with appropriate parameters
            if (strategyType === ReasoningStrategy.BEAM_SEARCH) {
                this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, request.beamWidth);
            }
            else {
                // All MCTS variants (base and experimental) use numSimulations
                this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, undefined, request.numSimulations);
            }
            // Update strategy in map
            this.strategies.set(strategyType, this.currentStrategy);
        }
        // Process thought using current strategy
        const response = await this.currentStrategy.processThought(request);
        // Add strategy information to response
        return {
            ...response,
            strategyUsed: this.getCurrentStrategyName()
        };
    }
    async getStats() {
        const nodes = await this.stateManager.getAllNodes();
        if (nodes.length === 0) {
            return {
                totalNodes: 0,
                averageScore: 0,
                maxDepth: 0,
                branchingFactor: 0,
                strategyMetrics: {}
            };
        }
        const scores = nodes.map(n => n.score);
        const depths = nodes.map(n => n.depth);
        const branchingFactors = nodes.map(n => n.children.length);
        const metrics = await this.getStrategyMetrics();
        return {
            totalNodes: nodes.length,
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            maxDepth: Math.max(...depths),
            branchingFactor: branchingFactors.reduce((a, b) => a + b, 0) / nodes.length,
            strategyMetrics: metrics
        };
    }
    async getStrategyMetrics() {
        const metrics = {};
        for (const [name, strategy] of this.strategies.entries()) {
            metrics[name] = await strategy.getMetrics();
            if (strategy === this.currentStrategy) {
                metrics[name] = {
                    ...metrics[name],
                    active: true
                };
            }
        }
        return metrics;
    }
    getCurrentStrategyName() {
        for (const [name, strategy] of this.strategies.entries()) {
            if (strategy === this.currentStrategy) {
                return name;
            }
        }
        return ReasoningStrategy.BEAM_SEARCH;
    }
    async getBestPath() {
        return this.currentStrategy.getBestPath();
    }
    async clear() {
        await this.stateManager.clear();
        // Clear all strategies
        for (const strategy of this.strategies.values()) {
            await strategy.clear();
        }
    }
    setStrategy(strategyType, beamWidth, numSimulations) {
        if (!this.strategies.has(strategyType)) {
            throw new Error(`Unknown strategy type: ${strategyType}`);
        }
        // Create new strategy instance with appropriate parameters
        if (strategyType === ReasoningStrategy.BEAM_SEARCH) {
            this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, beamWidth);
        }
        else {
            // All MCTS variants (base and experimental) use numSimulations
            this.currentStrategy = StrategyFactory.createStrategy(strategyType, this.stateManager, undefined, numSimulations);
        }
        // Update strategy in map
        this.strategies.set(strategyType, this.currentStrategy);
    }
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
}
