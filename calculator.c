#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

// Function to apply an operator to two operands
int applyOperator(int left, int right, char operator) {
    if (operator == '+') return left + right;
    if (operator == '-') return left - right;
    if (operator == '*') return left * right;
    if (operator == '/') return left / right;
    return 0; 
}

// Function to determine the precedence of an operator
int precedence(char operator) {
    if (operator == '*' || operator == '/') {
        return 2;
    }
    if (operator == '+' || operator == '-') {
        return 1;
    }
    return 0;
}

int allocate(int length) {
    return length; // For simplicity, just return the length for memory allocation
}

// Function to evaluate an expression
int evaluate(const char* expression) {
    int values[100]; // Stack for values
    char operators[100]; // Stack for operators
    int valueTop = -1, operatorTop = -1; // Stack pointers
    
    int i = 0;

    // Iterate through the expression
    while (expression[i] != '\0') {
        // Skip spaces
        if (expression[i] == ' ') {
            i++;
            continue;
        }

        // If the character is a number, push it to the value stack
        if (isdigit(expression[i])) {
            int num = 0;
            while (i < strlen(expression) && isdigit(expression[i])) {
                num = num * 10 + (expression[i] - '0');
                i++;
            }
            // Check if the number is negative
            if (expression[i] == ')'){
                num = -num;
            }
            values[++valueTop] = num;
        }

        // If the charactes is like (-5) or (-8), continue
        else if (expression[i] == '(' || expression[i] == ')') {
            i++;
            continue;
        }

        // If the character is a negative sign, continue
        else if (expression[i] == '-' && expression[i-1] == '(') {
            i++;
            continue;
        }

        // If the character is an operator, handle operator precedence
        else if (expression[i] == '+' || expression[i] == '-' || expression[i] == '*' || expression[i] == '/') {
            while (operatorTop != -1 && precedence(operators[operatorTop]) >= precedence(expression[i])) {
                int right = values[valueTop--];
                int left = values[valueTop--];
                char operator = operators[operatorTop--];
                values[++valueTop] = applyOperator(left, right, operator);
            }
            operators[++operatorTop] = expression[i++];
        }
    }

    // Apply remaining operators
    while (operatorTop != -1) {
        int right = values[valueTop--];
        int left = values[valueTop--];
        char operator = operators[operatorTop--];
        values[++valueTop] = applyOperator(left, right, operator);
    }

    return values[valueTop]; // The result is the only value left in the stack
}


