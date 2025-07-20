# OnlyTruth Backend

AI-powered video analysis backend built with Elysia and Bun.

## Architecture

- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Elysia (TypeScript-first web framework)
- **Queue System**: BullMQ with Redis
- **File Processing**: Built-in upload handling with validation

## Project Structure

```
back/
├── app/                    # Main application code
│   ├── src/
│   │   ├── config/        # Environment configuration
│   │   ├── services/      # Business logic services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Shared utilities
│   │   └── index.ts       # Main server entry point
│   ├── package.json       # Dependencies and scripts
│   └── tsconfig.json      # TypeScript configuration
└── memory-bank/           # Project documentation and context
```

## Quick Start

1. **Prerequisites**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Install Redis (for queue system)
   # macOS: brew install redis
   # Ubuntu: sudo apt install redis-server
   ```

2. **Install Dependencies**
   ```bash
   cd back/app
   bun install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # REDIS_HOST=localhost
   # REDIS_PORT=6379
   # PORT=3001
   ```

4. **Start Development Server**
   ```bash
   # Start Redis (if not running)
   redis-server
   
   # Start the backend
   bun run dev
   ```

## API Endpoints

### Video Upload
```http
POST /api/videos/upload
Content-Type: multipart/form-data

FormData:
- file: Video file (MP4, MOV, AVI)
- title: Optional video title
```

Response:
```json
{
  "videoId": "uuid",
  "status": "processing",
  "processingJobId": "job-uuid"
}
```

### Job Status
```http
GET /api/videos/:videoId/status
```

Response:
```json
{
  "videoId": "uuid",
  "status": "completed",
  "progress": 100,
  "results": {
    "transcription": [...],
    "claims": [...],
    "factChecks": [...]
  }
}
```

## Services

### Upload Service
- File validation and size limits
- Secure file handling
- Metadata extraction

### Queue Service
- Background job processing
- Progress tracking
- Error handling and retries
- Job prioritization

## Processing Pipeline

1. **Video Upload** - File validation and storage
2. **Transcription** - Speech-to-text conversion
3. **Speaker Identification** - Identify different speakers
4. **Claim Extraction** - Extract factual claims
5. **Fact Checking** - Verify claims against sources

## Development

### Scripts
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run test         # Run tests (when implemented)
```

### Code Quality
- TypeScript for type safety
- Structured logging with Winston
- Error handling throughout
- Environment-based configuration

## Deployment

### Docker (Coming Soon)
```bash
# Build image
docker build -t onlytruth-backend .

# Run container
docker run -p 3001:3001 onlytruth-backend
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `` |
| `REDIS_DB` | Redis database | `0` |
| `UPLOAD_MAX_SIZE` | Max file size (bytes) | `104857600` (100MB) |
| `UPLOAD_ALLOWED_TYPES` | Allowed MIME types | `video/mp4,video/mov,video/avi` |

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include logging for debugging
4. Update documentation for new features
5. Add tests for new functionality

## License

[License information]