const LEVELS = [
    {
        name: "Level 1",
        gridSize: 8,
        lasers: [
            { x: 0, y: 3, direction: 'right' }
        ],
        targets: [{ x: 7, y: 3 }],
        fixedBlockers: [],
        movableMirrors: [
            { id: 1, x: 2, y: 2, type: 'mirror1' },
            { id: 2, x: 3, y: 4, type: 'mirror2' }
        ],
        emptyCells: [
            {x: 2, y: 3}, {x: 3, y: 2}, {x: 4, y: 4}, {x: 4, y: 5},
            {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 4}
        ]
    }
];