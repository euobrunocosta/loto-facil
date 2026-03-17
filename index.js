/**
 * Lotofácil Number Generator
 * 
 * Logic:
 * 1. Generate a pool of 25 numbers (01-25).
 * 2. Pick 10 random "base numbers" that will be in all 3 groups.
 * 3. Split the remaining 15 numbers into 3 sets of 5.
 * 4. Combine base numbers with each set to create 3 groups of 15 numbers.
 */

function generateLotofacilGroups() {
    const allNumbers = Array.from({ length: 25 }, (_, i) => 
        (i + 1).toString().padStart(2, '0')
    );

    const shuffle = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const shuffledFullPool = shuffle(allNumbers);

    const baseNumbers = shuffledFullPool.slice(0, 10);
    const remainingPool = shuffledFullPool.slice(10);

    const group1Extra = remainingPool.slice(0, 5);
    const group2Extra = remainingPool.slice(5, 10);
    const group3Extra = remainingPool.slice(10, 15);

    const group1 = [...baseNumbers, ...group1Extra].sort((a, b) => a - b);
    const group2 = [...baseNumbers, ...group2Extra].sort((a, b) => a - b);
    const group3 = [...baseNumbers, ...group3Extra].sort((a, b) => a - b);

    return {
        base: baseNumbers.sort((a, b) => a - b),
        groups: [group1, group2, group3]
    };
}

function displayResults() {
    const { base, groups } = generateLotofacilGroups();

    console.log('\x1b[35m%s\x1b[0m', '=========================================');
    console.log('\x1b[35m%s\x1b[0m', '      LOTOFÁCIL - GENERATOR PRO          ');
    console.log('\x1b[35m%s\x1b[0m', '=========================================');
    
    console.log('\n\x1b[33m%s\x1b[0m', 'Base Numbers (shared by all groups):');
    console.log('\x1b[32m%s\x1b[0m', `[ ${base.join(' - ')} ]`);

    groups.forEach((group, index) => {
        console.log('\n\x1b[36m%s\x1b[0m', `Group ${index + 1} (15 Numbers):`);
        console.log('\x1b[37m%s\x1b[0m', `[ ${group.join(' - ')} ]`);
    });

    console.log('\n\x1b[35m%s\x1b[0m', '=========================================');
}

// Execute
displayResults();
