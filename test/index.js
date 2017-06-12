/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/mongoose/mongoose.d.ts"/>

var chai = require('chai'),
    mongoose = require('mongoose'),

    lib = require('../'),

    expect = chai.expect;

describe('modelToAvroSchema', function () {
  it('should convert supported types', function () {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Types'));

    expect(avroSchema.fields.arrayProp.type).to.be.deep.equal(['null', 'array']);

    expect(avroSchema.fields.arrayTypedProp.type).to.be.deep.equal(['null', 'array']);
    expect(avroSchema.fields.arrayTypedProp.items).to.be.deep.equal({
      type: 'object'
    });

    expect(avroSchema.fields.mixedProp.type).to.be.deep.equal(['null', 'object']);

    expect(avroSchema.fields.objectId.type).to.be.deep.equal(['null', 'string']);

    expect(avroSchema.fields.booleanProp.type).to.be.deep.equal(['null', 'boolean']);

    expect(avroSchema.fields.numberProp.type).to.be.deep.equal(['null', 'float']);

    expect(avroSchema.fields.objectProp.type).to.be.deep.equal(['null', 'object']);

    expect(avroSchema.fields.stringProp.type).to.be.deep.equal(['null', 'string']);

    expect(avroSchema.fields.dateProp.type).to.be.deep.equal(['null', 'long']);
    expect(avroSchema.fields.dateProp.logicalType).to.be.equal('timestamp-millis');
  });

  it('should convert constraints', function (done) {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Constraints'));

    expect(avroSchema.fields.simpleProp).to.exist;

    expect(avroSchema.fields.requiredProp.type).to.be.equal('string');

    expect(avroSchema.fields.enumedProp).to.exist;
    expect(avroSchema.fields.enumedProp.enum).to.be.deep.equal(['one', 'two']);

    expect(avroSchema.fields.defaultProp).to.exist;
    expect(avroSchema.fields.defaultProp.default).to.be.equal('default-value');

    done();
  });

  it('should convert nested schema', function () {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Nested'));
    console.log(avroSchema);

    expect(avroSchema.fields.root.fields).to.exist;
    expect(avroSchema.fields.root.fields.nestedProp).to.exist;
    expect(avroSchema.fields.root.required).to.be.deep.equal(['nestedProp']);
  });

  describe('options', function(){
    describe('reserved', function(){
      it('should filter out fields provided as an array', function(){
        var avroSchema = lib.modelToAvroSchema(mongoose.model('Types'), {
          reserved: ['stringProp']
        });
        expect(avroSchema.fields.stringProp).to.be.undefined;
      });
      it('should filter out fields as defined in a flag map', function(){
        var avroSchema = lib.modelToAvroSchema(mongoose.model('Types'), {
          reserved: {
            stringProp: true,
            _id: false
          }
        });
        expect(avroSchema.fields.stringProp).to.be.undefined;
        expect(avroSchema.fields._id).to.exist;
      });
    })
  });
});
