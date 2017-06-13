/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/mongoose/mongoose.d.ts"/>
var avro = require('avro-js');
var chai = require('chai'),
    mongoose = require('mongoose'),

    lib = require('../'),

    expect = chai.expect;

describe('modelToAvroSchema', function () {
  it('should convert supported types', function () {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Types'));
    console.log(JSON.stringify(avroSchema));
    avro.parse(avroSchema);

    var fieldsByName = {};
    avroSchema.fields.forEach(function(f) {
      fieldsByName[f.name] = f;
    });

    //expect(fieldsByName.arrayProp.type).to.be.deep.equal(['null', 'array']);

    //expect(fieldsByName.arrayTypedProp.type).to.be.deep.equal(['null', 'array']);
    //expect(fieldsByName.arrayTypedProp.items).to.be.deep.equal({
    //  type: 'object'
    //});

    //expect(fieldsByName.mixedProp.type).to.be.deep.equal(['null', 'object']);

    expect(fieldsByName.objectId.type).to.be.deep.equal(['null', 'string']);

    expect(fieldsByName.booleanProp.type).to.be.deep.equal(['null', 'boolean']);

    expect(fieldsByName.numberProp.type).to.be.deep.equal(['null', 'float']);

    //expect(fieldsByName.objectProp.type).to.be.deep.equal(['null', 'object']);

    expect(fieldsByName.stringProp.type).to.be.deep.equal(['null', 'string']);

    expect(fieldsByName.dateProp.type).to.be.deep.equal(['null', 'long']);
    expect(fieldsByName.dateProp.logicalType).to.be.equal('timestamp-millis');
  });

  it('should convert constraints', function (done) {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Constraints'));

    var fieldsByName = {};
    avroSchema.fields.forEach(function(f) {
      fieldsByName[f.name] = f;
    });

    expect(fieldsByName.simpleProp).to.exist;

    expect(fieldsByName.requiredProp.type).to.be.equal('string');

    expect(fieldsByName.enumedProp).to.exist;
    expect(fieldsByName.enumedProp.enum).to.be.deep.equal(['one', 'two']);

    expect(fieldsByName.defaultProp).to.exist;
    expect(fieldsByName.defaultProp.default).to.be.equal('default-value');

    done();
  });

  it('should convert nested schema', function () {
    var avroSchema = lib.modelToAvroSchema(mongoose.model('Nested'));

    var fieldsByName = {};
    avroSchema.fields.forEach(function(f) {
      fieldsByName[f.name] = f;
    });

    console.log(avroSchema);

    expect(fieldsByName.root.fields).to.exist;
    expect(fieldsByName.root.fields.nestedProp).to.exist;
    expect(fieldsByName.root.required).to.be.deep.equal(['nestedProp']);
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

        var fieldsByName = {};
        avroSchema.fields.forEach(function(f) {
          fieldsByName[f.name] = f;
        });

        expect(fieldsByName.stringProp).to.be.undefined;
        expect(fieldsByName._id).to.exist;
      });
    })
  });
});
