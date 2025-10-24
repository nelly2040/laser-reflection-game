const LEVELS = [
    {
        name: "Level 1 - Beginner",
        gridSize: 8,
        laser: { x: 0, y: 3, direction: 'right' },
        targets: [{ x: 7, y: 3 }],
        blockers: [],
        availableMirrors: { mirror1: 2, mirror2: 2 }
    },
    {
        name: "Level 2 - Reflection",
        gridSize: 8,
        laser: { x: 0, y: 1, direction: 'right' },
        targets: [{ x: 7, y: 6 }],
        blockers: [{ x: 3, y: 3 }, { x: 4, y: 4 }],
        availableMirrors: { mirror1: 3, mirror2: 1 }
    },
    {
        name: "Level 3 - Double Target",
        gridSize: 10,
        laser: { x: 0, y: 4, direction: 'right' },
        targets: [{ x: 9, y: 2 }, { x: 9, y: 6 }],
        blockers: [{ x: 2, y: 2 }, { x: 2, y: 6 }, { x: 5, y: 4 }],
        availableMirrors: { mirror1: 4, mirror2: 2 }
    },
    {
        name: "Level 4 - Maze",
        gridSize: 12,
        laser: { x: 0, y: 5, direction: 'right' },
        targets: [{ x: 11, y: 5 }],
        blockers: [
            { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 },
            { x: 4, y: 6 }, { x: 4, y: 7 }, { x: 4, y: 8 },
            { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
            { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }
        ],
        availableMirrors: { mirror1: 6, mirror2: 3 }
    },
    {
        name: "Level 5 - Final Challenge",
        gridSize: 12,
        laser: { x: 0, y: 0, direction: 'down' },
        targets: [{ x: 11, y: 11 }, { x: 0, y: 11 }],
        blockers: [
            { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
            { x: 7, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 9 }, { x: 10, y: 10 }
        ],
        availableMirrors: { mirror1: 5, mirror2: 5 }
    }
];