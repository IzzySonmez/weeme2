// OpenAI API Test Script
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OPENAI_KEY = process.env.OPENAI_API_KEY;

console.log('🔑 Testing OpenAI API Connection...');
console.log('API Key present:', OPENAI_KEY ? 'Yes' : 'No');
console.log('API Key length:', OPENAI_KEY ? OPENAI_KEY.length : 0);
console.log('API Key starts with sk-:', OPENAI_KEY ? OPENAI_KEY.startsWith('sk-') : false);

if (!OPENAI_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

async function testOpenAI() {
  try {
    console.log('\n🚀 Making test request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'User-Agent': 'weeme-ai/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Test message - just respond with "API connection successful"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ OpenAI API Response:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      console.log('✅ Generated content:', content);
      return true;
    } else {
      console.error('❌ No content in response');
      return false;
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Run test
testOpenAI().then(success => {
  if (success) {
    console.log('\n🎉 OpenAI API connection successful!');
  } else {
    console.log('\n💥 OpenAI API connection failed!');
  }
  process.exit(success ? 0 : 1);
});