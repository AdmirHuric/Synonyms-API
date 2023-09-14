export default class SynonymsGraph {
    private graph: Map<string, string[]>;

    constructor() {
        this.graph = new Map<string, string[]>();
    }

    addSynonym(word: string, synonym: string) {
        this.addWord(word);
        this.addWord(synonym);
        this.addEdge(word, synonym);
        this.addEdge(synonym, word);

        this.updateTransitiveClosure(word, synonym);
        this.updateTransitiveClosure(synonym, word);
    }

    deleteSynonym(word: string, synonym: string) {
        if (this.graph.has(word) && this.graph.has(synonym)) {
            this.removeEdge(word, synonym);
            this.removeEdge(synonym, word);
        }
    }

    hasSynonym(word: string, synonym: string): boolean {
        const synonyms = this.graph.get(word);
        return synonyms ? synonyms.includes(synonym) : false;
    }

    searchSynonyms(word: string): string[] {
        const synonyms = this.graph.get(word);
        if (synonyms && synonyms.length > 0) {
            return [...synonyms].reverse();
        }
        return [];
    }

    private addWord(word: string) {
        if (!this.graph.has(word)) {
            this.graph.set(word, []);
        }
    }

    private addEdge(word: string, synonym: string) {
        if (!this.graph.get(word)?.includes(synonym)) {
            this.graph.get(word)?.push(synonym);
        }
    }

    private removeEdge(word: string, synonym: string) {
        const edges = this.graph.get(word);
        if (edges) {
            const index = edges.indexOf(synonym);
            if (index !== -1) {
                edges.splice(index, 1);
            }
        }
    }

    //BFS traverse
    private updateTransitiveClosure(word: string, synonym: string) {
        const visited = new Set<string>();
        const queue: string[] = [synonym];
        visited.add(word);
        visited.add(synonym);

        while (queue.length > 0) {
            const current = queue.shift() as string;

            if (this.graph.has(current)) {
                for (const adjacent of this.graph.get(current) || []) {
                    if (!visited.has(adjacent)) {
                        this.addEdge(word, adjacent);
                        this.addEdge(adjacent, word);
                        visited.add(adjacent);
                        queue.push(adjacent);
                    }
                }
            }
        }
    }
}
