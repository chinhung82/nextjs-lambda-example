import { handler } from '../../app/lambda/handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

describe('Lambda Handler Unit Tests', () => {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'testFunction',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:testFunction',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/testFunction',
    logStreamName: '2023/01/01/[$LATEST]testStream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  test('should return hello message on GET /api/hello', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      path: '/api/hello',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      body: null,
      isBase64Encoded: false,
    };

    const result = await handler(event, mockContext);
    
    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Hello from Lambda!');
    expect(body.path).toBe('/api/hello');
  });

  test('should create user on POST /api/users', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/api/users',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      isBase64Encoded: false,
    };

    const result = await handler(event, mockContext);
    
    expect(result.statusCode).toBe(201);
    
    const body = JSON.parse(result.body);
    expect(body.message).toBe('User created successfully');
    expect(body.data).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });
});