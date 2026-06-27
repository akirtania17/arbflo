#!/bin/bash
echo "Starting ArbFlo Backend..."
cd backend
uvicorn api:app --reload &

echo "Starting ArbFlo Frontend..."
cd ../frontend
npm run dev

wait
