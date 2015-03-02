import _ from "lodash";
import parser from "./parser";

export default class Assembler {
  constructor(input) {
    var rawParsed = parser.parse(input.toString());
    this.parsed = _.compact(rawParsed);
    this.references = {};
    this.labels = {};

    // Max size per instruction is 5-bytes, so the buffer size needs to be at most
    // length * 5
    this.buffer = new Buffer(this.parsed.length * 5);
    this.buffer.fill(0);
    this.pointer = 0;

    this.opcodes = {
      "nop":   0x00,
      "push":  0x01,
      "pop":   0x02,
      "load":  0x03,
      "store": 0x04,
      "jmp":   0x05,
      "jz":    0x06,
      "jnz":   0x07,
      "add":   0x08,
      "sub":   0x09,
      "mul":   0x0a,
      "div":   0x0b,
      "print": 0x0c,
      "stop":  0x0d
    };

    this.operandSizes = {
      "push":  4,
      "load":  1,
      "store": 1,
      "jmp":   2,
      "jz":    2,
      "jnz":   2
    }
  }

  assemble() {
    // First we go through and assemble expressions, keeping track of label and
    // reference locations
    _.each(this.parsed, (element) => {
      if (element.expression != null) {
        this.writeExpression(element.expression);
      } else {
        this.labels[element.label] = this.pointer;
      }
    });

    // We only used up to this.pointer bytes, so slice off the rest
    this.buffer = this.buffer.slice(0, this.pointer);

    // Go back through and replace references with their label addresses
    _.each(this.references, (address, label) => {
      this.pointer = address;
      this.write(this.labels[label], 2);
    });

    return this.buffer;
  }

  writeExpression(expr) {
    this.write(this.opcodes[expr.opcode], 1);
    if (expr.operand != null) {
      this.writeOperand(expr);
    }
  }

  writeOperand(expr) {
    var op = expr.operand;
    if (op.literal != null) {
      this.write(op.literal, this.operandSizes[expr.opcode]);
    } else {
      this.references[op.reference] = this.pointer;
      this.pointer += 2
    }
  }

  write(value, size) {
    this.buffer.writeUIntLE(value, this.pointer, size);
    this.pointer += size;
  }
}
