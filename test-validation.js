// Simple test script for the validation workflow
const fetch = require('node-fetch');

async function testValidation() {
  const address = "123 Main Street, New York, NY";
  
  console.log('Testing address:', address);
  
  // Test 1: Parse with libpostal
  try {
    const parseResponse = await fetch('http://localhost:5000/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    
    if (parseResponse.ok) {
      const parseResult = await parseResponse.json();
      console.log('✅ Libpostal parsing works:', parseResult);
    } else {
      console.log('❌ Libpostal parsing failed:', parseResponse.status);
    }
  } catch (error) {
    console.log('❌ Libpostal error:', error.message);
  }
  
  // Test 2: DeepSeek validation (if Ollama is running)
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `Is "${address}" a valid US address? Answer yes or no.`,
        stream: false
      })
    });
    
    if (ollamaResponse.ok) {
      const ollamaResult = await ollamaResponse.json();
      console.log('✅ DeepSeek validation works:', ollamaResult.response?.trim());
    } else {
      console.log('❌ DeepSeek validation failed:', ollamaResponse.status);
    }
  } catch (error) {
    console.log('❌ DeepSeek error:', error.message);
  }
  
  // Test 3: Google Geocoding (if API key is set)
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const encoded = encodeURIComponent(address);
      const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${googleKey}`);
      
      if (googleResponse.ok) {
        const googleResult = await googleResponse.json();
        console.log('✅ Google Geocoding works:', googleResult.status, googleResult.results?.[0]?.formatted_address);
      } else {
        console.log('❌ Google Geocoding failed:', googleResponse.status);
      }
    } catch (error) {
      console.log('❌ Google error:', error.message);
    }
  } else {
    console.log('ℹ️  Google API key not set, skipping geocoding test');
  }
}

testValidation(); 