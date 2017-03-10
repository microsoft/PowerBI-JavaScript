const chai = require('chai');
const retabber = require('./retabber');
const expect = chai.expect;

const CODE_4 =
`the\t\twords\tin\t\tthis\tparagraph
should\tlook\tlike\tthey\tare
evenly\tspaced\tbetween\tcolumns`;

const CODE_8 =
`the\twords\t\tin\t\tthis\t\tparagraph
should\tlook\t\tlike\t\tthey\t\tare
evenly\tspaced\t\tbetween\t\tcolumns`;

describe('retabber', function() {
  describe('.smart', function() {
    it('uses 4 spaces', function() {
      var actual = retabber.smart(CODE_4, 4);
      expect(actual).to.equal(
`the     words   in      this    paragraph
should  look    like    they    are
evenly  spaced  between columns`
        );
    });

    it('uses 8 spaces', function() {
      var actual = retabber.smart(CODE_8, 8);
      expect(actual).to.equal(
`the     words           in              this            paragraph
should  look            like            they            are
evenly  spaced          between         columns`
        );
    });
  });

  describe('.regular', function() {
    it('uses 4 spaces', function() {
      var actual = retabber.regular(CODE_4, 4);
      expect(actual).to.equal(
`the        words    in        this    paragraph
should    look    like    they    are
evenly    spaced    between    columns`
        );
    });

    it('uses 8 spaces', function() {
      var actual = retabber.regular(CODE_8, 8);
      expect(actual).to.equal(
`the        words                in                this                paragraph
should        look                like                they                are
evenly        spaced                between                columns`
        );
    });
  });
});

