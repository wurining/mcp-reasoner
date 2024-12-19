import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from './types';
import { StateManager } from './state';
export class ReasoningEngine {
    stateManager;
    constructor() {
        this.stateManager = new StateManager(CONFIG.cacheSize);
    }
    evaluateThought(node, parent) {
        // Scoring factors:
        // 1. Logical progression
        const logicalScore = parent ?
            (node.thought.length > 10 ? 0.7 : 0.3) : 0.5;
        // 2. Depth penalty to favor shorter solutions
        const depthPenalty = Math.max(0, 1 - (node.depth / CONFIG.maxDepth) * 0.3);
        // 3. Completion bonus
        const completionBonus = node.isComplete ? 0.2 : 0;
        return (logicalScore + depthPenalty + completionBonus) / 3;
    }
    async expandNode(node) {
        if (node.depth >= CONFIG.maxDepth || node.isComplete) {
            return [];
        }
        const children = await this.stateManager.getChildren(node.id);
        if (children.length > 0) {
            return children;
        }
        return [];
    }
    async processThought(request) {
        // Create new node
        const nodeId = uuidv4();
        const parentNode = request.parentId ?
            await this.stateManager.getNode(request.parentId) : undefined;
        const node = {
            id: nodeId,
            thought: request.thought,
            depth: request.thoughtNumber - 1,
            score: 0,
            children: [],
            parentId: request.parentId,
            isComplete: !request.nextThoughtNeeded
        };
        // Calculate score
        node.score = this.evaluateThought(node, parentNode);
        // Save node
        await this.stateManager.saveNode(node);
        // Update parent's children if exists
        if (parentNode) {
            parentNode.children.push(node.id);
            await this.stateManager.saveNode(parentNode);
        }
        // Get path information
        const currentPath = await this.stateManager.getPath(nodeId);
        const pathScore = currentPath.reduce((acc, n) => acc + n.score, 0) / currentPath.length;
        return {
            nodeId: node.id,
            thought: node.thought,
            score: node.score,
            depth: node.depth,
            isComplete: node.isComplete,
            nextThoughtNeeded: request.nextThoughtNeeded,
            possiblePaths: currentPath.length,
            bestScore: pathScore
        };
    }
    async clear() {
        await this.stateManager.clear();
    }
}
