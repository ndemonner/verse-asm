global.chai = require('chai');
var spies = require('chai-spies');

chai.use(spies);

global.expect = chai.expect;
