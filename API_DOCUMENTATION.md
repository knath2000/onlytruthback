# OnlyTruth Backend API Documentation

## Overview

The OnlyTruth backend is built with **Elysia.js** (Bun runtime) and provides AI-powered video analysis for political debates. The API handles video uploads, processing orchestration, and fact-checking results.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://onlytruth-backend.fly.dev` (when deployed)

## API Endpoints

### Health Check

#### GET `/health`
Returns the health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-20T17:59:53.676Z",
  "uptime": 123.456,
  "version": "1.0.0",
  "environment": "development"
}
```

### Root Endpoint

#### GET `/`
Returns basic API information and documentation link.

**Response:**
```json
{
  "message": "OnlyTruth API",
  "version": "1.0.0",
  "documentation": "/swagger"
}
```

### Video Management

#### POST `/api/videos/upload`
Upload a video file for AI-powered analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Video file (max 100MB, formats: .mp4, .avi, .mov, .webm, .mkv)

**Response:**
```json
{
  "id": "uuid-v4",
  "filename": "uuid-v4.mp4",
  "originalName": "debate_clip.mp4",
  "size": 15728640,
  "status": "uploaded",
  "createdAt": "2025-07-20T17:59:53.676Z",
  "updatedAt": "2025-07-20T17:59:53.676Z"
}
```

#### GET `/api/videos/{videoId}/status`
Get the processing status and results for a video.

**Parameters:**
- `videoId` (path): UUID of the uploaded video

**Response:**
```json
{
  "videoId": "uuid-v4",
  "status": "processing", // "uploaded" | "processing" | "completed" | "failed"
  "progress": 75,
  "results": {
    "transcription": {
      "segments": [
        {
          "id": "uuid-v4-segment-1",
          "start": 0,
          "end": 10,
          "text": "Sample transcription segment",
          "confidence": 0.95
        }
      ]
    },
    "claims": [
      {
        "id": "uuid-v4-claim-1",
        "claim": "Sample extracted claim",
        "confidence": 0.88
      }
    ],
    "factChecks": [
      {
        "claimId": "uuid-v4-claim-1",
        "status": "verified", // "verified" | "false" | "unverifiable"
        "confidence": 0.7,
        "sources": [
          {
            "url": "https://example.com/source",
            "title": "Source Title",
            "relevance": 0.9
          }
        ]
      }
    ]
  }
}
```

### Job Management

#### GET `/api/jobs/{jobId}/status`
Get the status of a specific processing job.

**Parameters:**
- `jobId` (path): UUID of the processing job

**Response:**
```json
{
  "jobId": "uuid-v4",
  "status": "active", // "waiting" | "active" | "completed" | "failed"
  "progress": 50,
  "data": {
    "videoId": "uuid-v4",
    "stage": "transcription" // "transcription" | "claim_extraction" | "fact_checking"
  },
  "createdAt": "2025-07-20T17:59:53.676Z",
  "processedAt": "2025-07-20T17:59:53.676Z"
}
```

## Interactive API Documentation

Visit `/swagger` for interactive API documentation powered by Swagger UI.

## Architecture

### Technology Stack
- **Runtime**: Bun
- **Framework**: Elysia.js
- **Queue System**: BullMQ with Redis
- **File Storage**: Local filesystem (uploads/)
- **Logging**: Winston with JSON format
- **Deployment**: Docker + Fly.io

### Core Services

#### Upload Service
- Handles file validation and storage
- Supports video formats: MP4, AVI, MOV, WebM, MKV
- Maximum file size: 100MB
- Creates unique filenames with UUID

#### Queue Service
- Manages background processing jobs
- Uses BullMQ for job queuing and processing
- Supports job status tracking and progress updates
- Handles retries and error recovery

#### Logger Service
- Structured JSON logging with Winston
- Performance monitoring with duration tracking
- Separate log files for errors and combined logs
- Configurable log levels

### Processing Pipeline

1. **Video Upload**: Client uploads video file
2. **File Validation**: Check format, size, and basic integrity
3. **Job Creation**: Create processing job in queue
4. **Transcription**: Extract audio and generate transcript (Modal Labs)
5. **Claim Extraction**: Identify factual claims using AI
6. **Fact Checking**: Verify claims against reliable sources (Perplexity)
7. **Result Storage**: Store results and notify client

### Configuration

Environment variables:
```bash
# Server
PORT=3001
HOST=localhost
NODE_ENV=development

# File Upload
UPLOAD_DIR=./uploads
TEMP_DIR=./temp

# Redis (for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Database (future)
DATABASE_URL=postgresql://localhost:5432/onlytruth

# External APIs
PERPLEXITY_API_KEY=your_key_here
MODAL_TOKEN_ID=your_token_id
MODAL_TOKEN_SECRET=your_token_secret
MODAL_ENDPOINT=your_endpoint_url

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ORIGINS=http://localhost:3000
```

## Error Handling

The API uses standard HTTP status codes and returns structured error responses:

```json
{
  "error": "Error message",
  "code": 400
}
```

Common status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently not implemented but recommended for production:
- Upload endpoint: 10 requests per minute per IP
- Status endpoints: 100 requests per minute per IP

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent DoS attacks
- CORS configuration restricts cross-origin requests
- Input sanitization on all endpoints
- No sensitive data in logs

## Deployment

### Local Development
```bash
cd back/app
bun install
bun run dev
```

### Docker Deployment
```bash
cd back
docker build -t onlytruth-backend .
docker run -p 3001:3001 onlytruth-backend
```

### Fly.io Deployment
```bash
cd back
fly deploy
```

## Future Enhancements

1. **Database Integration**: PostgreSQL for persistent storage
2. **Authentication**: JWT-based user authentication
3. **WebSocket Support**: Real-time progress updates
4. **Caching**: Redis caching for frequently accessed data
5. **Monitoring**: Health checks and metrics collection
6. **Rate Limiting**: Request throttling and abuse prevention
7. **File Storage**: Cloud storage (AWS S3) for scalability