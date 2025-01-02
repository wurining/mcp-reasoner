import { CONFIG } from './types.js';
import { StateManager } from './state.js';
import { StrategyFactory, ReasoningStrategy } from './strategies/factory.js';
export class Reasoner {
    constructor() {
        this.stateManager = new StateManager(CONFIG.cacheSize);
        // Initialize available strategies
        this.strategies = new Map();
        this.strategies.set(ReasoningStrategy.BEAM_SEARCH, StrategyFactory.createStrategy(ReasoningStrategy.BEAM_SEARCH, this.stateManager));
        this.strategies.set(ReasoningStrategy.MCTS, StrategyFactory.createStrategy(ReasoningStrategy.MCTS, this.stateManager));
        // Set default strategy
        const defaultStrategy = CONFIG.defaultStrategy;
        this.currentStrategy = this.strategies.get(defaultStrategy) ||
            this.strategies.get(ReasoningStrategy.BEAM_SEARCH);
    }
    async processThought(request) {
        // Switch strategy if requested
        if (request.strategyType && this.strategies.has(request.strategyType)) {
            this.currentStrategy = this.strategies.get(request.strategyType);
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
    setStrategy(strategyType) {
        if (!this.strategies.has(strategyType)) {
            throw new Error(`Unknown strategy type: ${strategyType}`);
        }
        this.currentStrategy = this.strategies.get(strategyType);
    }
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
}
