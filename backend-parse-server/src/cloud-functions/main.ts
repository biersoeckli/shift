Parse.Cloud.define('hello', () => {
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});
