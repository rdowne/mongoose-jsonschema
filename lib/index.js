/**
 * A module for converting Mongoose schema to Avro schema.
 * @module mongoose-jsonschema
 */

module.exports = {
  modelToAvroSchema: modelToAvroSchema
};

/**
 * @alias module:mongoose-jsonschema
 * @param   {object}  model     Mongoose model to be converted
 * @param   {object}  options   Options for customising model conversion
 * @param   {string[]|object} options.reserved - Model properties found in the array are not included in the schema or map of properties to be converted
 * @param   {boolean} options.reserved.property - Include/do not include model `property` into schema
 * @returns {Object}  AvroSchema
 */
function modelToAvroSchema(model, options) {
  'use strict';

  var schema =  model.schema,
      reserved = {
        '_id': true,
        '__v': true
      },
      required = schema.requiredPaths().filter(function (requiredProp) {
        return requiredProp.indexOf('.') === -1;
      }),
      result = {
        name: model.modelName,
        type: 'record',
        fields: []
      };

  options = options || {};

  if (options.reserved) {
    if (Array.isArray(options.reserved)) {
      options.reserved.forEach(function(r) {
        reserved[r] = true;
      });
    } else {
      reserved = Object.assign(reserved, options.reserved);
    }
  }

  schema.eachPath(function (path) {
    if (!reserved[path]) {
      var frags = path.split('.');

      var field = {
        name: frags.pop()
      };

      var pathOptions = schema.path(path).options;

      switch (pathOptions.type.name) {
      case 'Array': // untyped array
        field.type = 'array';
        field.items = 'string'
        break;
      case 'Boolean':
      case 'Object':
      case 'String':
        field.type = pathOptions.type.name.toLowerCase();
        break;
      case 'Date':
        field.type = 'long';
        field.logicalType = 'timestamp-millis';
        break;
      case 'ObjectId':
        field.type = 'string';
        break;
      case 'Integer':
        field.type = 'int';
        break;
      case 'Number':
        field.type = 'float';
        break;
      case 'Object':

      default:
        // mixed type
        if(pathOptions.type.schemaName) {
          field.type = 'object';
        }

        // typed array
        if (Array.isArray(pathOptions.type)) {
          field.type = 'array';
          field.items = {
            type: schema.path(path).casterConstructor.name.toLowerCase()
          };
        }
      }

      if (pathOptions.enum) {
        field.enum = pathOptions.enum;
      }

      if (pathOptions.default) {
        field.default = pathOptions.default;
      }

      if (required.indexOf(path) === -1 && field.type !== 'array') {
        field.type = ['null', field.type];
      }

      var fields = result.fields;
      //console.log(fields);
      //console.log(frags);

      frags.forEach(function (frag, index) {
        fields[frag] = fields[frag] || {
          name: frag,
          type: 'record',
          fields: {}
        };

        if (index === (frags.length - 1) && schema.requiredPaths().indexOf(frags.join('.') + '.' + field.name) !== -1) {
          fields[frag].required = fields[frag].required || [];
          fields[frag].required.push(field.name);
        }

        fields = fields[frag].fields;
      });

      console.log(typeof fields);
      if (!Array.isArray(fields))
        console.log(JSON.stringify(fields));
      fields.push(field);
    }
  });

  return result;
}

function mapPrimitiveType(name, value) {
  var field = {
    name: name
  };

  switch (pathOptions.type.name) {
  case 'Boolean':
  case 'String':
    field.type = pathOptions.type.name.toLowerCase();
    break;
  case 'Date':
    field.type = 'long';
    field.logicalType = 'timestamp-millis';
    break;
  case 'ObjectId':
    field.type = 'string';
    break;
  case 'Integer':
    field.type = 'int';
    break;
  case 'Number':
    field.type = 'float';
    break;
  }

  return field;
}

function convertComplexProperty(name, contents) {
  return {
    name: name,
    type: {
      type: 'record',
      name: `${name}_record`,
      fields: convertProperties(contents)
    }
  };
}
