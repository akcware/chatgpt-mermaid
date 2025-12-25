#!/bin/bash

# Test script for Mermaid Diagram Renderer API endpoints
# Make sure the Next.js dev server is running on localhost:3000

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Testing Mermaid API Endpoints"
echo "======================================"
echo ""

# Test 1: Verify endpoint with valid code
echo "Test 1: Verify valid Mermaid code"
echo "Request:"
echo '{"code":"graph TD\n  A[Start] --> B[End]"}'
echo ""
echo "Response:"
curl -s -X POST "${BASE_URL}/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\n  A[Start] --> B[End]"}' | jq '.'
echo ""
echo "======================================"
echo ""

# Test 2: Verify endpoint with invalid code
echo "Test 2: Verify invalid Mermaid code"
echo "Request:"
echo '{"code":"invalid mermaid syntax !!!"}'
echo ""
echo "Response:"
curl -s -X POST "${BASE_URL}/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"code":"invalid mermaid syntax !!!"}' | jq '.'
echo ""
echo "======================================"
echo ""

# Test 3: Render endpoint
echo "Test 3: Render valid Mermaid diagram"
echo "Request:"
echo '{"code":"graph LR\n  A --> B"}'
echo ""
echo "Response (truncated):"
curl -s -X POST "${BASE_URL}/api/render" \
  -H "Content-Type: application/json" \
  -d '{"code":"graph LR\n  A --> B"}' | jq '.svg | .[0:100] + "..."'
echo ""
echo "======================================"
echo ""

# Test 4: SVG endpoint
echo "Test 4: Generate SVG export"
echo "Request:"
echo '{"code":"graph TB\n  Start --> End"}'
echo ""
echo "Response (showing filename only):"
curl -s -X POST "${BASE_URL}/api/svg" \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TB\n  Start --> End"}' | jq '{filename: .filename, svg_length: (.svg | length)}'
echo ""
echo "======================================"
echo ""

# Test 5: Missing code parameter
echo "Test 5: Missing code parameter"
echo "Request:"
echo '{}'
echo ""
echo "Response:"
curl -s -X POST "${BASE_URL}/api/verify" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo ""
echo "======================================"
echo ""

# Test 6: Invalid JSON
echo "Test 6: Invalid JSON"
echo "Request:"
echo 'not valid json'
echo ""
echo "Response:"
curl -s -X POST "${BASE_URL}/api/verify" \
  -H "Content-Type: application/json" \
  -d 'not valid json' | jq '.'
echo ""
echo "======================================"
echo ""

echo "All tests completed!"

