export class ReasoningEngine {
    constructor() {
        this.thoughts = [];
        this.beamWidth = 3;
        this.minScore = 0.5;
    }
    evaluateThought(thought) {
        // Simple scoring based on:
        // - Length (indicating detail)
        // - Contains mathematical expressions
        // - Contains logical connectors
        let score = 0;
        // Length score
        score += Math.min(thought.thought.length / 100, 0.4);
        // Mathematical expressions
        if (/[+\-*/=<>]/.test(thought.thought)) {
            score += 0.2;
        }
        // Logical connectors
        if (/\b(therefore|because|if|then|thus|hence|so)\b/i.test(thought.thought)) {
            score += 0.2;
        }
        return score;
    }
    addThought(thought, thoughtNumber, totalThoughts, nextThoughtNeeded) {
        const node = {
            thought,
            thoughtNumber,
            totalThoughts,
            nextThoughtNeeded,
            score: 0,
            children: []
        };
        // Evaluate thought
        node.score = this.evaluateThought(node);
        // Add to parent if this is not the first thought
        if (this.thoughts.length > 0) {
            const potentialParents = this.thoughts.filter(t => t.thoughtNumber === thoughtNumber - 1);
            if (potentialParents.length > 0) {
                // Find best parent based on score
                const bestParent = potentialParents.reduce((a, b) => a.score > b.score ? a : b);
                node.parent = bestParent;
                bestParent.children.push(node);
            }
        }
        // Keep beam width best thoughts at each level
        const sameLevel = this.thoughts.filter(t => t.thoughtNumber === thoughtNumber);
        sameLevel.push(node);
        if (sameLevel.length > this.beamWidth) {
            sameLevel.sort((a, b) => b.score - a.score);
            sameLevel.splice(this.beamWidth);
        }
        this.thoughts.push(node);
        return node;
    }
    getBestPath() {
        const bestLast = [...this.thoughts]
            .filter(t => !t.nextThoughtNeeded)
            .sort((a, b) => b.score - a.score)[0];
        if (!bestLast)
            return [];
        const path = [bestLast];
        let current = bestLast;
        while (current.parent) {
            path.unshift(current.parent);
            current = current.parent;
        }
        return path;
    }
    getStats() {
        return {
            totalThoughts: this.thoughts.length,
            bestScore: Math.max(...this.thoughts.map(t => t.score)),
            averageScore: this.thoughts.reduce((a, b) => a + b.score, 0) / this.thoughts.length,
            branchingFactor: this.thoughts.reduce((a, b) => a + b.children.length, 0) / this.thoughts.length
        };
    }
}
