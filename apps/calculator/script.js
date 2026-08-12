const screen = document.getElementById("display");
const buttons = document.querySelectorAll("button");
let currentInput = "0";
let firstNumber = null;
let operator = null;
function calculate(first, op, second) {
    if (op == "+")
        return first + second;
    else if (op == "−")
        return first - second;
    else if (op == "×")
        return first * second;
    else if (op == "÷") {
        if (second === 0)
            return "UNDEFINED";
        else
            return first / second;
    }
}
buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        if (button.classList.contains("clear-button")) {
            currentInput = "0";
            firstNumber = null;
            operator = null;
            screen.textContent = currentInput;
            return;
        }
        if (button.classList.contains("equal-button")) {
            let result = calculate(firstNumber, operator, Number(currentInput));
            currentInput = String(result);
            screen.textContent = currentInput;
            return;
        }
        if (button.classList.contains("operator")) {
            if (operator !== null) {
                let pending = calculate(firstNumber, operator, Number(currentInput));
                firstNumber = pending;
            }
            else if (operator === null) {
                firstNumber = Number(currentInput);
            }
            operator = button.textContent;
            currentInput = "0";
            return;
        }
        if (button.textContent === "." && currentInput.includes("."))
            return;
        if (currentInput === "0")
            currentInput = button.textContent;
        else
            currentInput += button.textContent;
        screen.textContent = currentInput;
    });
});