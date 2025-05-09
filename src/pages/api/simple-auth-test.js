// src/pages/api/simple-auth-test.js
// A simplified test for Vertex AI authentication

import dotenv from 'dotenv';
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth } from 'google-auth-library';

// Load environment variables
dotenv.config();

/**
 * A simplified API endpoint to test various authentication methods
 */
export async function GET() {
  try {
    // Get basic configuration
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || "europe-west1";
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    
    // Log environment state
    console.log("=== Simple Auth Test ===");
    console.log(`Project ID: ${projectId}`);
    console.log(`Location: ${location}`);
    console.log(`Model: ${modelName}`);
    console.log(`Has JSON credentials: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON}`);
    
    // Test results to return
    const results = {
      tests: [],
      success: false,
      projectId,
      location,
      environment: process.env.NETLIFY ? 'netlify' : 'development'
    };
    
    // Attempt 1: Try with JSON credentials directly
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        console.log("TEST 1: Using parsed JSON credentials directly");
        results.tests.push({ name: "Parse JSON", status: "running" });
        
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        results.tests[0].status = "success";
        results.tests.push({ name: "JSON structure", details: { 
          type: credentials.type,
          project_id: credentials.project_id,
          has_private_key: !!credentials.private_key,
          has_client_email: !!credentials.client_email
        }});
        
        // Create bare-minimum Vertex client
        console.log("Creating Vertex AI client with direct credentials");
        results.tests.push({ name: "Create Vertex AI client", status: "running" });
        
        const vertexAI = new VertexAI({
          project: projectId,
          location: location,
          credentials: credentials
        });
        
        results.tests[results.tests.length-1].status = "success";
        
        // Try to get the model
        console.log("Getting generative model");
        results.tests.push({ name: "Get generative model", status: "running" });
        
        const generativeModel = vertexAI.getGenerativeModel({
          model: modelName,
        });
        
        results.tests[results.tests.length-1].status = "success";
        
        // Try a very simple prompt
        console.log("Testing with a simple prompt");
        results.tests.push({ name: "Generate content", status: "running" });
        
        const response = await generativeModel.generateContent({
          contents: [{ role: "user", parts: [{ text: "Hi" }] }],
        });
        
        results.tests[results.tests.length-1].status = "success";
        
        // Get the response text
        const responseText = response.response.candidates[0].content.parts[0].text;
        results.tests.push({ name: "Response", details: responseText.substring(0, 50) + "..." });
        
        results.success = true;
        results.authMethod = "direct_json_credentials";
        
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error("Error in TEST 1:", error);
        results.tests.push({ 
          name: "Direct JSON credentials error", 
          status: "failed",
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    // Attempt 2: Try Google Auth directly
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        console.log("TEST 2: Using GoogleAuth directly");
        results.tests.push({ name: "GoogleAuth test", status: "running" });
        
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        
        // First, attempt to get a token directly with GoogleAuth
        const auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        results.tests[results.tests.length-1].status = "progress";
        
        const token = await client.getAccessToken();
        results.tests[results.tests.length-1].status = "success";
        
        results.tests.push({ 
          name: "Google Auth token", 
          details: { 
            token_type: token.token_type,
            expiry: new Date(token.expiry_date).toISOString(),
            token_preview: token.token.substring(0, 10) + "..."
          }
        });
        
        // Try Vertex AI again with a client created after obtaining a token
        console.log("Creating Vertex AI after verified token");
        results.tests.push({ name: "Create Vertex AI after token", status: "running" });
        
        const vertexAI = new VertexAI({
          project: projectId,
          location: location,
          credentials: credentials
        });
        
        results.tests[results.tests.length-1].status = "success";
        
        // Get the model
        const generativeModel = vertexAI.getGenerativeModel({
          model: modelName,
        });
        
        results.tests.push({ name: "Get model after token", status: "success" });
        
        // Try content generation
        const response = await generativeModel.generateContent({
          contents: [{ role: "user", parts: [{ text: "Hello" }] }],
        });
        
        const responseText = response.response.candidates[0].content.parts[0].text;
        results.tests.push({ name: "Response after token", details: responseText.substring(0, 50) + "..." });
        
        results.success = true;
        results.authMethod = "google_auth_then_vertex";
        
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error("Error in TEST 2:", error);
        results.tests.push({ 
          name: "GoogleAuth test error", 
          status: "failed",
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    // Attempt 3: Try with explicit Application Default Credentials
    try {
      console.log("TEST 3: Using application default credentials");
      results.tests.push({ name: "Application Default Credentials", status: "running" });
      
      // Set ADC to the JSON
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        
        process.env.GCLOUD_PROJECT = credentials.project_id;
        
        console.log("Using credentials project:", credentials.project_id);
      }
      
      const vertexAI = new VertexAI({
        project: projectId,
        location: location
      });
      
      results.tests[results.tests.length-1].status = "progress";
      
      const generativeModel = vertexAI.getGenerativeModel({
        model: modelName,
      });
      
      results.tests[results.tests.length-1].status = "progress";
      
      const response = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: "Test" }] }],
      });
      
      results.tests[results.tests.length-1].status = "success";
      
      const responseText = response.response.candidates[0].content.parts[0].text;
      results.tests.push({ name: "ADC Response", details: responseText.substring(0, 50) + "..." });
      
      results.success = true;
      results.authMethod = "application_default";
      
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error("Error in TEST 3:", error);
      results.tests.push({ 
        name: "ADC test error", 
        status: "failed",
        error: error.message,
        stack: error.stack
      });
    }
    
    // All tests failed
    results.finalError = "All authentication methods failed";
    
    return new Response(JSON.stringify(results), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    // Catch-all error
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}