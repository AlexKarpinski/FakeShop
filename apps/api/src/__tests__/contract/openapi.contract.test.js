const SwaggerParser = require('@apidevtools/swagger-parser');
const openapiSpec = require('../../docs/openapi');

describe('contract OpenAPI spec', () => {
  it('is a valid OpenAPI 3 document', async () => {
    await expect(SwaggerParser.validate(openapiSpec)).resolves.toBeDefined();
    expect(openapiSpec.openapi).toMatch(/^3\./);
  });

  it('defines bearerAuth security scheme', () => {
    expect(openapiSpec.components.securitySchemes.bearerAuth).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  });
});
