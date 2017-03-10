import { expect } from 'chai';
import parser from './opts-parser';

describe('opts-parser', function() {
  let opts = null;

  describe('.defaults', function() {
    before(function() {
      opts = {'foo': 'bar'};
      parser.defaults(opts, {'foo': 'default', 'fiz-biz': 1});
    });

    it('has foo', () => expect(opts).to.have.property('foo'));
    it('is bar', () => expect(opts.foo).to.equal('bar'));
    it('has fiz-biz', () => expect(opts).to.contain.keys(['fizBiz', 'fiz-biz']));
    it('is 1', () => expect(opts.fizBiz).to.equal(1));
  });

  describe('.parse', function() {
    describe('booleans', function() {
      before(() => opts = parser.parse('foo: true; bar: false;'));
      it('has true foo', () => expect(opts.foo).to.eql(true));
      it('has false bar', () => expect(opts.bar).to.eql(false));
    });

    describe('words', function() {
      before(() => opts = parser.parse('foo: bar'));
      it('has foo', () => expect(opts).to.have.property('foo'));
      it('is bar', () => expect(opts.foo).to.equal('bar'));
    });

    describe('arrays', function() {
      before(() => opts = parser.parse('foo: [hello, world]'));
      it('has foo', () => expect(opts).to.have.property('foo'));
      it('is array', () => expect(opts.foo).to.eql(['hello', 'world']));
    });

    describe('strings', function() {
      describe('single quoted', function() {
        before(() => opts = parser.parse('foo: \'hello, world\' '));
        it('has foo', () => expect(opts).to.have.property('foo'));
        it('is hello, world', () => expect(opts.foo).to.equal('hello, world'));
      });

      describe('double quoted', function() {
        before(() => opts = parser.parse('foo: "hello, world" '));
        it('has foo', () => expect(opts).to.have.property('foo'));
        it('is hello, world', () => expect(opts.foo).to.equal('hello, world'));
      });
    });

    describe('all', function() {
      before(() => opts = parser.parse('foo-baz: \'hello, world\'; helloWorld: [1,2,3]; color: #000'));
      it('has keys', () => expect(opts).to.have.keys(['fooBaz', 'foo-baz', 'helloWorld', 'color']));
      it('has color', () => expect(opts.color).to.eql('#000'));
    });
  });
});
