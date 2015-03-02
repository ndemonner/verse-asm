import Assembler from "../lib/assembler";
import VM from "verse-vm";
import fs from "fs";

function loadVasmFixture(name) {
  return fs.readFileSync(`test/fixtures/${name}.vasm`);
}

function loadBytecodeFixture(name) {
  return fs.readFileSync(`test/fixtures/${name}.vm`);
}

describe('assembler', function () {
  it('converts an assembly buffer to a bytecode buffer', function () {
    var asm = loadVasmFixture('factorial');
    var manualBytecode = loadBytecodeFixture('factorial');

    var assembler = new Assembler(asm);
    var bytecode = assembler.assemble();
    expect(bytecode).to.eql(manualBytecode);
  });

  it('produces executable bytecode', function () {
    var asm = loadVasmFixture('factorial');
    var assembler = new Assembler(asm);
    var bytecode = assembler.assemble();

    var vm = new VM;
    vm.load(bytecode);
    var result = vm.execute();

    expect(result.value).to.eql(3628800);
  });
});
