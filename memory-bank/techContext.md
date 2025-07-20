# OnlyTruth Backend - Tech Context

## Technologies Used

### Runtime Environment
- **Node.js**: JavaScript runtime (v18+ LTS)
  - Benefits: Event-driven architecture, excellent for real-time applications
  - Use case: API server, WebSocket management, job orchestration

- **TypeScript**: Strongly typed JavaScript superset
  - Configuration: Strict mode enabled, targeting ES2022
  - Benefits: Compile-time error detection, better developer experience
  - Use case: All application code with comprehensive type definitions

### Framework & Libraries
- **Express.js**: Web application framework
  - Version: Latest stable
  - Benefits: Mature ecosystem, excellent middleware support
  - Use case: REST API endpoints, middleware orchestration

- **Socket.IO**: Real-time bidirectional event-based communication
  - Version: Latest stable
  - Benefits: WebSocket with fallbacks, room management
  - Use case: Live debate streaming, client state synchronization

### Database & Storage
- **PostgreSQL**: Relational database with JSONB support
  - Version: 15+
  - Benefits: ACID compliance, excellent performance, JSON storage
  - Use case: Persistent data storage, complex queries, transactions

- **Redis**: In-memory data structure store
  - Version: 7+
  - Benefits: High performance, pub/sub, persistence options
  - Use case: BullMQ job queue, session storage, caching

### Queue Management
- **BullMQ**: Redis-based queue for Node.js
  - Version: Latest stable
  - Benefits: Robust job processing, retries, priorities
  - Use case: Background processing, Modal Labs job orchestration

### AI & Processing
- **Modal Labs**: Serverless GPU computing platform
  - Use case: GPU-intensive AI processing (transcription, diarization, LLM)
  - Benefits: Auto-scaling, cost-effective GPU access

- **OpenAI API**: Large language model API
  - Model: GPT-4o for claim extraction
  - Benefits: Advanced reasoning, structured output
  - Use case: Factual claim identification and categorization

- **Perplexity API**: AI search and fact-checking
  - Integration: server-perplexity-ask MCP tool
  - Benefits: Real-time search, source attribution
  - Use case: Automated fact-checking with verifiable sources

### Deployment & Infrastructure
- **Fly.io**: Platform-as-a-Service for deployment
  - Benefits: Global edge deployment, PostgreSQL integration
  - Use case: API hosting, database management, auto-scaling

- **Docker**: Containerization platform
  - Use case: Consistent development and deployment environments

## Development Setup

### Prerequisites
```bash
# Node.js (via nvm recommended)
nvm install 18
nvm use 18

# pnpm package manager
npm install -g pnpm

# Docker for local development
# Install from https://docker.com

# Fly.io CLI
curl -L https://fly.io/install.sh | sh
```

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/onlytruth
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
MODAL_TOKEN_ID=ak-...
MODAL_TOKEN_SECRET=as-...

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret

# External APIs
YOUTUBE_COOKIES_CONTENT=...  # For YouTube downloads
GROQ_API_KEY=...  # Optional for faster transcription
```

### Project Setup
```bash
# Clone and setup
git clone <backend-repo-url>
cd onlytruth-backend

# Install dependencies
pnpm install

# Setup database
pnpm run db:setup
pnpm run db:migrate

# Start development
pnpm run dev
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## Technical Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "bullmq": "^4.0.0",
    "ioredis": "^5.3.0",
    "openai": "^4.0.0",
    "modal": "^0.63.0",
    "yt-dlp-wrap": "^2.7.0",
    "winston": "^3.10.0",
    "joi": "^17.9.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^3.12.0",
    "tsc-alias": "^1.8.0",
    "jest": "^29.6.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.0.0",
    "nodemon": "^3.0.0"
  }
}
```

## Technical Constraints

### Performance Requirements
- **API Response Time**: <200ms for REST endpoints
- **WebSocket Latency**: <100ms for real-time updates
- **Concurrent Connections**: Support 1000+ WebSocket connections
- **Processing Throughput**: Handle 5+ concurrent debate streams

### Scalability Constraints
- **Memory Usage**: <512MB per instance at idle
- **CPU Usage**: <80% during peak processing
- **Database Connections**: Pool of 20 connections max
- **Redis Memory**: <1GB for queue and cache data

### Security Requirements
- **Input Validation**: All API inputs validated with Joi schemas
- **Rate Limiting**: API endpoints protected against abuse
- **CORS**: Proper cross-origin request handling
- **Environment Variables**: Secrets stored securely, never in code

## Tool Usage Patterns

### Database Management
```typescript
// Prisma ORM for type-safe database operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Example usage
async function createDebate(data: CreateDebateInput) {
  return prisma.debate.create({
    data: {
      title: data.title,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      status: 'pending'
    }
  });
}
```

### Queue Management
```typescript
// BullMQ for job processing
import { Queue, Worker } from 'bullmq';

const debateQueue = new Queue('debate-processing', {
  connection: redisConnection,
});

// Job creation
await debateQueue.add('analyze-debate', {
  debateId: 'uuid',
  audioUrl: 'https://...',
  priority: 1
});

// Worker processing
const worker = new Worker('debate-processing', async (job) => {
  return processDebateJob(job.data);
}, { connection: redisConnection });
```

### Modal Labs Integration
```typescript
// Modal client for GPU processing
import modal from 'modal';

class ModalClient {
  private client: modal.Client;
  
  async analyzeDebateSegment(audioData: Buffer, transcript: string) {
    const result = await this.client.function.call(
      'analyze_debate_segment',
      {
        audio_data: audioData,
        transcript: transcript,
        context: { language: 'en' }
      }
    );
    
    return result;
  }
}
```

### WebSocket Management
```typescript
// Socket.IO for real-time communication
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join-debate', (debateId: string) => {
    socket.join(`debate:${debateId}`);
  });
  
  socket.on('audio-chunk', async (data) => {
    await processLiveAudio(data.debateId, data.audioData);
  });
});
```

## Integration Patterns

### API Design
```typescript
// REST API with Express
app.post('/api/debates', async (req: Request, res: Response) => {
  try {
    const validatedData = debateSchema.validate(req.body);
    const debate = await createDebate(validatedData);
    res.status(201).json(debate);
  } catch (error) {
    handleApiError(error, res);
  }
});

// WebSocket events
io.on('connection', (socket) => {
  socket.emit('debate-update', {
    type: 'transcription',
    data: transcriptionData
  });
});
```

### Error Handling
```typescript
// Centralized error handling
class ErrorHandler {
  static handle(error: Error, context: string) {
    logger.error('Error occurred', {
      error: error.message,
      stack: error.stack,
      context
    });
    
    // Send to monitoring service
    this.reportError(error, context);
  }
}

// API error middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  ErrorHandler.handle(error, `API ${req.method} ${req.path}`);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Logging & Monitoring
```typescript
// Winston logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// Performance monitoring
class PerformanceMonitor {
  static trackDuration(operation: string) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      logger.info('Performance metric', {
        operation,
        duration,
        timestamp: new Date().toISOString()
      });
    };
  }
}
```

## Deployment Configuration

### Fly.io Configuration
```toml
# fly.toml
app = "onlytruth-backend"
primary_region = "sea"

[env]
NODE_ENV = "production"
PORT = "3001"

[[services]]
internal_port = 3001
protocol = "tcp"
min_machines_running = 1

[[services.ports]]
port = 80
handlers = ["http"]

[[services.ports]]
port = 443
handlers = ["http", "tls"]

[build]
dockerfile = "Dockerfile"

[[services.http_checks]]
interval = "10s"
grace_period = "30s"
method = "GET"
path = "/health"
```

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Management
- **Development**: Local PostgreSQL and Redis instances
- **Staging**: Fly.io with shared database, reduced Modal Labs quota
- **Production**: Fly.io with dedicated resources, full AI API quotas
- **Secrets**: Managed through Fly.io secrets, never in environment files 