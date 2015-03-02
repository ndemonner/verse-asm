"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var parser = _interopRequire(require("./parser"));

var Assembler = (function () {
  function Assembler(input) {
    _classCallCheck(this, Assembler);

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
      nop: 0,
      push: 1,
      pop: 2,
      load: 3,
      store: 4,
      jmp: 5,
      jz: 6,
      jnz: 7,
      add: 8,
      sub: 9,
      mul: 10,
      div: 11,
      print: 12,
      stop: 13
    };

    this.operandSizes = {
      push: 4,
      load: 1,
      store: 1,
      jmp: 2,
      jz: 2,
      jnz: 2
    };
  }

  _prototypeProperties(Assembler, null, {
    assemble: {
      value: function assemble() {
        var _this = this;
        // First we go through and assemble expressions, keeping track of label and
        // reference locations
        _.each(this.parsed, function (element) {
          if (element.expression != null) {
            _this.writeExpression(element.expression);
          } else {
            _this.labels[element.label] = _this.pointer;
          }
        });

        // We only used up to this.pointer bytes, so slice off the rest
        this.buffer = this.buffer.slice(0, this.pointer);

        // Go back through and replace references with their label addresses
        _.each(this.references, function (address, label) {
          _this.pointer = address;
          _this.write(_this.labels[label], 2);
        });

        return this.buffer;
      },
      writable: true,
      configurable: true
    },
    writeExpression: {
      value: function writeExpression(expr) {
        this.write(this.opcodes[expr.opcode], 1);
        if (expr.operand != null) {
          this.writeOperand(expr);
        }
      },
      writable: true,
      configurable: true
    },
    writeOperand: {
      value: function writeOperand(expr) {
        var op = expr.operand;
        if (op.literal != null) {
          this.write(op.literal, this.operandSizes[expr.opcode]);
        } else {
          this.references[op.reference] = this.pointer;
          this.pointer += 2;
        }
      },
      writable: true,
      configurable: true
    },
    write: {
      value: function write(value, size) {
        this.buffer.writeUIntLE(value, this.pointer, size);
        this.pointer += size;
      },
      writable: true,
      configurable: true
    }
  });

  return Assembler;
})();

module.exports = Assembler;