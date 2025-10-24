const LEVELS = [
    {
        name: "Level 1 - Beginner",
        gridSize: 8,
        laser: { x: 0, y: 3, direction: 'right' },
        targets: [{ x: 7, y: 3 }],
        fixedBlockers: [],
        movableMirrors: [
            { id: 1, x: 2, y: 2, type: 'mirror1' },
            { id: 2, x: 3, y: 4, type: 'mirror2' }
        ],
        emptyCells: [{x: 2, y: 3}, {x: 3, y: 2}, {x: 4, y: 4}, {x: 4, y: 5}]
    },
    {
        name: "Level 2 - Reflection",
        gridSize: 8,
        laser: { x: 0, y: 1, direction: 'right' },
        targets: [{ x: 7, y: 6 }],
        fixedBlockers: [{ x: 3, y: 3 }, { x: 4, y: 4 }],
        movableMirrors: [
            { id: 1, x: 2, y: 2, type: 'mirror1' },
            { id: 2, x: 4, y: 2, type: 'mirror2' },
            { id: 3, x: 5, y: 5, type: 'mirror1' }
        ],
        emptyCells: [{x: 1, y: 4}, {x: 2, y: 5}, {x: 3, y: 6}, {x: 5, y: 3}, {x: 6, y: 4}]
    },
    {
        name: "Level 3 - Double Target",
        gridSize: 10,
        laser: { x: 0, y: 4, direction: 'right' },
        targets: [{ x: 9, y: 2 }, { x: 9, y: 6 }],
        fixedBlockers: [{ x: 2, y: 2 }, { x: 2, y: 6 }, { x: 5, y: 4 }],
        movableMirrors: [
            { id: 1, x: 3, y: 3, type: 'mirror1' },
            { id: 2, x: 4, y: 5, type: 'mirror2' },
            { id: 3, x: 6, y: 3, type: 'mirror1' },
            { id: 4, x: 7, y: 5, type: 'mirror2' }
        ],
        emptyCells: [
            {x: 1, y: 1}, {x: 1, y: 7}, {x: 3, y: 1}, {x: 3, y: 7}, 
            {x: 4, y: 2}, {x: 4, y: 6}, {x: 6, y: 1}, {x: 6, y: 7},
            {x: 7, y: 2}, {x: 7, y: 6}, {x: 8, y: 3}, {x: 8, y: 5}
        ]
    },
    {
        name: "Level 4 - Maze",
        gridSize: 12,
        laser: { x: 0, y: 5, direction: 'right' },
        targets: [{ x: 11, y: 5 }],
        fixedBlockers: [
            { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 },
            { x: 4, y: 6 }, { x: 4, y: 7 }, { x: 4, y: 8 },
            { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
            { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 },
            { x: 10, y: 0 }, { x: 10, y: 1 }, { x: 10, y: 2 }
        ],
        movableMirrors: [
            { id: 1, x: 1, y: 1, type: 'mirror1' },
            { id: 2, x: 3, y: 3, type: 'mirror2' },
            { id: 3, x: 5, y: 5, type: 'mirror1' },
            { id: 4, x: 7, y: 7, type: 'mirror2' },
            { id: 5, x: 9, y: 4, type: 'mirror1' },
            { id: 6, x: 11, y: 1, type: 'mirror2' }
        ],
        emptyCells: [
            {x: 1, y: 7}, {x: 3, y: 9}, {x: 5, y: 7}, {x: 7, y: 3},
            {x: 9, y: 6}, {x: 11, y: 3}, {x: 1, y: 9}, {x: 3, y: 11},
            {x: 5, y: 9}, {x: 7, y: 11}, {x: 9, y: 8}, {x: 11, y: 7}
        ]
    },
    {
        name: "Level 5 - Final Challenge",
        gridSize: 12,
        laser: { x: 0, y: 0, direction: 'down' },
        targets: [{ x: 11, y: 11 }, { x: 0, y: 11 }],
        fixedBlockers: [
            { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
            { x: 7, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 9 }, { x: 10, y: 10 },
            { x: 5, y: 1 }, { x: 6, y: 2 }, { x: 1, y: 5 }, { x: 2, y: 6 }
        ],
        movableMirrors: [
            { id: 1, x: 1, y: 3, type: 'mirror1' },
            { id: 2, x: 3, y: 1, type: 'mirror2' },
            { id: 3, x: 4, y: 6, type: 'mirror1' },
            { id: 4, x: 6, y: 4, type: 'mirror2' },
            { id: 5, x: 8, y: 6, type: 'mirror1' },
            { id: 6, x: 6, y: 8, type: 'mirror2' },
            { id: 7, x: 9, y: 11, type: 'mirror1' },
            { id: 8, x: 11, y: 9, type: 'mirror2' }
        ],
        emptyCells: [
            {x: 0, y: 5}, {x: 5, y: 0}, {x: 7, y: 5}, {x: 5, y: 7},
            {x: 11, y: 5}, {x: 5, y: 11}, {x: 3, y: 7}, {x: 7, y: 3},
            {x: 9, y: 7}, {x: 7, y: 9}, {x: 1, y: 9}, {x: 9, y: 1}
        ]
    }
];