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
document.addEventListener("keydown", function (event) {
  const key = event.key;

  
  if (key >= "0" && key <= "9") {
    const numberButton = Array.from(buttons).find(
      (btn) => btn.textContent === key
    );
    if (numberButton) numberButton.click();
    return;
  }

  
  if (key === ".") {
    const dotButton = Array.from(buttons).find(
      (btn) => btn.textContent === "."
    );
    if (dotButton) dotButton.click();
    return;
  }


  const operatorMap = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
  };
  if (operatorMap[key]) {
    event.preventDefault(); 
    const opButton = document.querySelector(
      `button[aria-label="${operatorMap[key]}"]`
    );
    if (opButton) opButton.click();
    return;
  }

  
  if (key === "Enter" || key === "=") {
    const equalButton = document.querySelector('button[aria-label="equals"]');
    if (equalButton) equalButton.click();
    return;
  }

  
  if (key === "Escape" || key.toLowerCase() === "c") {
    const clearButton = document.querySelector('button[aria-label="clear"]');
    if (clearButton) clearButton.click();
    return;
  }
});