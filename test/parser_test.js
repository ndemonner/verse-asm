import parser from "../lib/parser";
import fs from "fs";

function loadFixture(name) {
  return fs.readFileSync(`test/fixtures/${name}.vasm`);
}

describe('parser', function () {
  it('can parse a comment line', function () {
    var result = parser.parse("# Comment is cool");
    expect(result[0]).to.be.undefined;
  });

  it('can parse an expression', function () {
    var result = parser.parse("push");
    expect(result[0].expression.opcode).to.eql("push");
  });

  it('can parse an expression with a literal', function () {
    var result = parser.parse("push 1");
    expect(result[0].expression.opcode).to.eql("push");
    expect(result[0].expression.operand.literal).to.eql(1);
  });

  it('can parse an expression with a reference', function () {
    var result = parser.parse("jmp :label");
    expect(result[0].expression.opcode).to.eql("jmp");
    expect(result[0].expression.operand.reference).to.eql("label");
  });

  it('can parse a label', function () {
    var result = parser.parse("label:");
    expect(result[0].label).to.eql("label");
  });

  it('can parse multiple lines', function () {
    var result = parser.parse("label:\npush 1");
    expect(result[0].label).to.eql("label");
    expect(result[1].expression.opcode).to.eql("push");
    expect(result[1].expression.operand.literal).to.eql(1);
  });

  it('can parse inline comments', function () {
    var result = parser.parse("push 1 # Comment");
    expect(result[0].expression.opcode).to.eql("push");
    expect(result[0].expression.operand.literal).to.eql(1);
    expect(result[1]).to.be.undefined;
  });
});
