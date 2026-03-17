# Lotofácil Generator Strategy

[Live Demo](https://euobrunocosta.github.io/loto-facil/)

This project provides a smart grouping strategy for Lotofácil (1..25), picking 15 numbers in 3 separate groups based on a fixed set of 10 base numbers.

## Project Structure

- `index.js`: A Node.js CLI script for quick generation in the terminal.
- `index.html`: A premium web interface for visual generation.
- `app.js` & `style.css`: Logic and design for the web app.

## Logic Implementation

1. **Pool Generation**: Creates a pool of 25 numbers (01-25).
2. **Base Selection**: Randomly selects **10 numbers** to serve as the "Base". These 10 numbers are present in ALL 3 final groups.
3. **Variable Sets**: The remaining 15 numbers are split into 3 distinct sets of **5 numbers each**.
4. **Group Assembly**:
    - **Group 1**: 10 Base Numbers + first 5 variable numbers.
    - **Group 2**: 10 Base Numbers + second 5 variable numbers.
    - **Group 3**: 10 Base Numbers + final 5 variable numbers.

## How to Run

### CLI Version
To run the script in your terminal:
```bash
node index.js
```

### Web Version
Simply open `index.html` in any modern web browser.

---

### Logic Verification
- **Total Numbers per Group**: 10 (Base) + 5 (Variable) = 15.
- **Total Numbers Used**: 10 (Base) + 5 + 5 + 5 (Variables) = 25.
- **Coverage**: Every number from 01 to 25 is used exactly once across the base and the 3 variable sets.
