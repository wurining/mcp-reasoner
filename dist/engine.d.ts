interface ThoughtNode {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    score: number;
    children: ThoughtNode[];
    parent?: ThoughtNode;
}
export declare class ReasoningEngine {
    private thoughts;
    private readonly beamWidth;
    private readonly minScore;
    private evaluateThought;
    addThought(thought: string, thoughtNumber: number, totalThoughts: number, nextThoughtNeeded: boolean): ThoughtNode;
    getBestPath(): ThoughtNode[];
    getStats(): {
        totalThoughts: number;
        bestScore: number;
        averageScore: number;
        branchingFactor: number;
    };
}
export {};
