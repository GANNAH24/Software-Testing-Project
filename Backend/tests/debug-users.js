require('dotenv').config();
const { createTestUser, deleteTestUser } = require('./helpers/test-users');

async function test() {
  console.log('Testing createTestUser...');
  try {
    const email = `debug-${Date.now()}@test.com`;
    console.log('Creating user:', email);
    const result = await createTestUser(email, 'Test123!@#');
    console.log('User created:', JSON.stringify(result, null, 2));
    
    if (!result.userId) {
      console.error('UserId is missing!');
    } else {
      console.log('UserId is present:', result.userId);
    }
    
    console.log('Deleting user...');
    await deleteTestUser(result.userId);
    console.log('User deleted.');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

test();
