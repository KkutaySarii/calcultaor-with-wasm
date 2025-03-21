let wasmInstance;

fetch("calculator.wasm")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch the WebAssembly file.");
    }
    return response.arrayBuffer(); // Take the response and convert it to an ArrayBuffer
  })
  .then((bytes) => {
    return WebAssembly.instantiate(bytes); // Instantiate the WebAssembly module
  })
  .then((wasmModule) => {
    wasmInstance = wasmModule.instance;
    console.log("WebAssembly module loaded.");
  })
  .catch((error) => {
    console.error("Error loading WebAssembly module:", error);
  });

let hasOperation = false;

document.getElementById("clear").addEventListener("click", clear);
document.getElementById("plus-minus").addEventListener("click", plusMinus);
document.getElementById("percent").addEventListener("click", percent);
document.getElementById("divide").addEventListener("click", divide);
document.getElementById("seven").addEventListener("click", function () {
  press(7);
});
document.getElementById("eight").addEventListener("click", function () {
  press(8);
});
document.getElementById("nine").addEventListener("click", function () {
  press(9);
});

document.getElementById("multiply").addEventListener("click", multiply);
document.getElementById("four").addEventListener("click", function () {
  press(4);
});
document.getElementById("five").addEventListener("click", function () {
  press(5);
});
document.getElementById("six").addEventListener("click", function () {
  press(6);
});
document.getElementById("subtract").addEventListener("click", subtract);
document.getElementById("one").addEventListener("click", function () {
  press(1);
});
document.getElementById("two").addEventListener("click", function () {
  press(2);
});
document.getElementById("three").addEventListener("click", function () {
  press(3);
});
document.getElementById("add").addEventListener("click", add);
document.getElementById("calculator").addEventListener("click", openCalculator);
document.getElementById("zero").addEventListener("click", function () {
  press(0);
});
document.getElementById("comma").addEventListener("click", addComma);
document.getElementById("calculate").addEventListener("click", calculate);

function clear() {
  document.getElementById("display").textContent = "0";
  hasOperation = false;
}

function press(value) {
  let display = document.getElementById("display");
  if (display.textContent === "0") {
    display.textContent = value;
  } else {
    display.textContent += value;
  }
}

function checkProcessHasOperator() {
  let display = document.getElementById("display");

  let operators = ["+", "-", "*", "/"];

  for (let operator of operators) {
    if (display.textContent.includes(operator)) {
      return true;
    }
  }
  return false;
}

function plusMinus() {
  let display = document.getElementById("display");
  let currentText = display.textContent;

  if (
    currentText === "0" ||
    currentText.endsWith("*") ||
    currentText.endsWith("/") ||
    currentText.endsWith("+") ||
    currentText.endsWith("-")
  ) {
    return;
  }

  if (!hasOperation) {
    if (currentText.startsWith("(") && currentText.endsWith(")")) {
      display.textContent = currentText.substring(2, currentText.length - 1);
    } else {
      display.textContent = `(-${currentText})`;
    }
  } else {
    let lastOperatorIndex = 0;

    for (let i = currentText.length - 1; i >= 0; i--) {
      let character = currentText[i];

      if (character === "*" || character === "/" || character === "+") {
        lastOperatorIndex = i;
        break;
      }
      if (character === "-" && currentText[i - 1] !== "(") {
        lastOperatorIndex = i;
        break;
      }
    }

    let beforeOperator = currentText.substring(0, lastOperatorIndex + 1);
    let afterOperator = currentText.substring(lastOperatorIndex + 1);

    if (afterOperator.startsWith("(") && afterOperator.endsWith(")")) {
      afterOperator = afterOperator.substring(2, afterOperator.length - 1);
    } else {
      afterOperator = `(-${afterOperator})`;
    }

    display.textContent = beforeOperator + afterOperator;
  }
}

function checkLastCharacterIsOperator() {
  let display = document.getElementById("display");

  if (display.textContent.lastIndexOf("+") === display.textContent.length - 1) {
    return true;
  }

  if (display.textContent.lastIndexOf("-") === display.textContent.length - 1) {
    return true;
  }

  if (display.textContent.lastIndexOf("*") === display.textContent.length - 1) {
    return true;
  }

  if (display.textContent.lastIndexOf("/") === display.textContent.length - 1) {
    return true;
  }

  return false;
}

function add() {
  let display = document.getElementById("display");

  if (checkLastCharacterIsOperator()) {
    return;
  }

  display.textContent += "+";
  hasOperation = true;
}

function subtract() {
  let display = document.getElementById("display");

  if (checkLastCharacterIsOperator()) {
    return;
  }

  display.textContent += "-";
  hasOperation = true;
}

function multiply() {
  let display = document.getElementById("display");

  if (checkLastCharacterIsOperator()) {
    return;
  }

  display.textContent += "*";
  hasOperation = true;
}

function divide() {
  let display = document.getElementById("display");

  if (checkLastCharacterIsOperator()) {
    return;
  }

  display.textContent += "/";
  hasOperation = true;
}

function calculate() {
  let display = document.getElementById("display");
  let processText = document.getElementById("process");

  if (wasmInstance) {
    const expression = display.textContent;

    // Allocate memory for the string in WebAssembly memory
    const encodedExpression = new TextEncoder().encode(expression);
    const length = encodedExpression.length;
    const memory = wasmInstance.exports.memory; // Access the memory from WebAssembly

    // Allocate space in WebAssembly memory for the string
    const stringPtr = wasmInstance.exports.allocate(length);

    // Write the string into WebAssembly memory
    const memoryBuffer = new Uint8Array(memory.buffer);
    memoryBuffer.set(encodedExpression, stringPtr);

    // Call the evaluate function in WebAssembly with the pointer to the string
    let result = wasmInstance.exports.evaluate(stringPtr);

    if (result) {
      processText.textContent = display.textContent;
      display.textContent = result; // Show result on the display
    } else {
      alert("Bir sorun oldu.");
    }
  } else {
    console.log("WebAssembly module not loaded yet.");
  }
}
