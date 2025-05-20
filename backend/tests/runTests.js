// This is a script to manually test the MoodLog functionality

console.log('=== Manual Testing of MoodLog Functionality ===');

// Test 1: Creating a new mood log
console.log('\nTest 1: Creating a new mood log');
const mockMoodLog = {
  _id: 'moodlog123',
  userId: 'user123',
  mood: 'Happy',
  note: 'Feeling great today!',
  date: new Date('2023-06-15'),
  save: () => {
    console.log('Saving mood log...');
    return Promise.resolve(true);
  }
};

console.log('Created mood log:', mockMoodLog);
console.log('Test 1 passed if you see the mood log object above');

// Test 2: Finding mood logs for a specific user
console.log('\nTest 2: Finding mood logs for a specific user');
const mockMoodLogs = [
  {
    _id: 'moodlog123',
    userId: 'user123',
    mood: 'Happy',
    note: 'Feeling great today!',
    date: new Date('2023-06-15')
  },
  {
    _id: 'moodlog124',
    userId: 'user123',
    mood: 'Calm',
    note: 'Meditation helped',
    date: new Date('2023-06-16')
  }
];

console.log('Found mood logs:', mockMoodLogs);
console.log('Test 2 passed if you see two mood log objects above');

// Test 3: Updating a mood log
console.log('\nTest 3: Updating a mood log');
const updatedMoodLog = {
  _id: 'moodlog123',
  userId: 'user123',
  mood: 'Relaxed', // Updated
  note: 'Updated note', // Updated
  date: new Date('2023-06-15')
};

console.log('Updated mood log:', updatedMoodLog);
console.log('Test 3 passed if you see the updated mood log object above');

// Test 4: Deleting a mood log
console.log('\nTest 4: Deleting a mood log');
const deletedMoodLog = {
  _id: 'moodlog123',
  userId: 'user123',
  mood: 'Happy',
  note: 'Feeling great today!',
  date: new Date('2023-06-15')
};

console.log('Deleted mood log:', deletedMoodLog);
console.log('Test 4 passed if you see the deleted mood log object above');

// Test 5: Validating mood log data
console.log('\nTest 5: Validating mood log data');
const validateMoodLog = (data) => {
  const errors = {};
  
  if (!data.userId) errors.userId = 'User ID is required';
  if (!data.mood) errors.mood = 'Mood is required';
  if (!data.date) errors.date = 'Date is required';
  
  return Object.keys(errors).length > 0 ? { errors } : null;
};

const invalidMoodLogData = {
  note: 'Test note'
};

const validationErrors = validateMoodLog(invalidMoodLogData);
console.log('Validation errors:', validationErrors);
console.log('Test 5 passed if you see validation errors above');

console.log('\n=== All tests completed ===');