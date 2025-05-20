// A simple test file to verify Jest is working

describe('Simple Tests', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });

  test('string concatenation works', () => {
    expect('Hello ' + 'World').toBe('Hello World');
  });

  test('boolean logic works', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  test('arrays can be manipulated', () => {
    const array = [1, 2, 3];
    expect(array.length).toBe(3);
    expect(array[0]).toBe(1);
  });

  test('objects can be compared', () => {
    const obj = { name: 'Test', value: 42 };
    expect(obj).toEqual({ name: 'Test', value: 42 });
  });
});