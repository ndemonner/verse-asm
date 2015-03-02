### Verse Assembler

To run tests: `npm install && npm test`

To assemble some code: 

```
  import fs from "fs";
  import Assembler from "verse-asm";
  
  var inputBuffer = fs.readFileSync(...);
  var assembler = new Assembler(inputBuffer);
  var bytecode = assembler.assemble();

  // Now you can write out the `bytecode` buffer, or pass it into a VerseVM
  // instance for execution
```
