# WebAssembly Calculator

This project demonstrates a basic calculator using **C** code compiled to **WebAssembly** and integrated into a web page using JavaScript.

## C Code Explanation

The C code for the calculator includes a few essential functions for performing arithmetic operations. These functions are later compiled to WebAssembly and used in the JavaScript environment.

### Key C Functions:

1. **`applyOperator(int left, int right, char operator)`**:

   - This function takes two operands (`left`, `right`) and an operator (`+`, `-`, `*`, `/`), and performs the corresponding operation.
   - Returns the result of the operation.

2. **`precedence(char operator)`**:

   - This function returns the precedence of the operator.
   - It returns `2` for multiplication (`*`) and division (`/`), and `1` for addition (`+`) and subtraction (`-`).

3. **`evaluate(const char* expression)`**:
   - This function evaluates a mathematical expression passed as a string (`expression`).
   - It uses a stack to store the values and operators, processes them in the correct order (respecting operator precedence), and returns the final result.

### **emcc** Compilation Command

To compile the C code to WebAssembly, we use **Emscripten** (`emcc`). Below is the command used:

```bash
emcc calculator.c -o calculator.js -s EXPORTED_FUNCTIONS="['_evaluate', '_allocate']" -s WASM=1
```

#### Explanation of the `emcc` Command:

- **`emcc`**: This is the Emscripten compiler, used to compile C/C++ code into WebAssembly and JavaScript.
- **`calculator.c`**: The input C source code file.
- **`-o calculator.js`**: Specifies the output JavaScript file (`calculator.js`). This file will include the WebAssembly module.
- **`-s EXPORTED_FUNCTIONS="['_evaluate', '_allocate']"`**:
  - This option tells Emscripten to **export** the functions `_evaluate` and `_allocate` so they can be used in JavaScript.
  - `'_evaluate'` refers to the function that evaluates expressions (used for performing calculations).
  - `'_allocate'` is a memory allocation function that prepares memory for WebAssembly to store data.
- **`-s WASM=1`**: This flag ensures that WebAssembly (`.wasm`) is generated.

#### What does this command do?

- It compiles the `calculator.c` C file into JavaScript and WebAssembly files (`calculator.js` and `calculator.wasm`).
- The compiled JavaScript file contains the necessary JavaScript functions to interact with the WebAssembly module.
- The WebAssembly module allows efficient computation using native C code inside a web environment.

### Integrating WebAssembly with JavaScript

Once the WebAssembly module (`calculator.wasm`) is compiled, we need to integrate it into the web page using JavaScript.

### **Steps in JavaScript:**

1. **Loading the WebAssembly Module**:
   - The WebAssembly module is loaded asynchronously using `fetch()` and instantiated with `WebAssembly.instantiate()`.
   - The `wasmInstance` object holds the instance of the WebAssembly module, allowing interaction with its functions.
2. **Calling the `evaluate()` Function**:

   - The `evaluate()` function is invoked from WebAssembly to perform the calculation when the user presses the "equals" button.
   - It takes the current expression displayed on the screen, passes it to the WebAssembly module, and returns the result.

3. **Handling the `allocate()` Function**:
   - Memory allocation is handled by `allocate()` to prepare space for the string data from JavaScript before passing it to the WebAssembly module.

### Example JavaScript Code:

```javascript
let wasmInstance;

fetch("calculator.wasm")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch the WebAssembly file.");
    }
    return response.arrayBuffer(); // Take the response and convert it to an ArrayBuffer
  })
  .then((bytes) => {
    return WebAssembly.instantiate(bytes, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }), // Create a WebAssembly memory for the module
      },
    }); // Instantiate the WebAssembly module
  })
  .then((wasmModule) => {
    wasmInstance = wasmModule.instance;
    console.log("WebAssembly module loaded.");
  })
  .catch((error) => {
    console.error("Error loading WebAssembly module:", error);
  });

function calculate() {
  let display = document.getElementById("display");

  if (wasmInstance) {
    const expression = display.textContent;
    console.log("Expression:", expression); // Debugging: check what is passed to the WebAssembly module

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
    console.log("Result:", result); // Debugging: check the result returned by evaluate function

    display.textContent = result; // Show result on the display
  } else {
    console.log("WebAssembly module not loaded yet.");
  }
}
```

### Key Points:

- **Loading the WebAssembly module** using `fetch` and `WebAssembly.instantiate()`.
- **Using `allocate()`** to allocate memory for the string data (expression).
- **Calling `evaluate()`** from WebAssembly to perform the calculation using the string data passed from JavaScript.
- **Displaying the result** on the web page.

---

### Conclusion

This project demonstrates the integration of **C code with WebAssembly** and its interaction with JavaScript to create a simple calculator. The **Emscripten** toolchain is used to compile C functions into WebAssembly, and JavaScript handles the user interface and communication with the WebAssembly module.
