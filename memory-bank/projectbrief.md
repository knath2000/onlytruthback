# OnlyTruth Backend - Project Brief

## Project Overview
OnlyTruth backend is a Node.js/TypeScript API service that processes debate content to provide real-time transcription, speaker identification, claim extraction, and automated fact-checking. Built as an extension of the proven YouTube transcription system, it leverages existing infrastructure while adding AI-powered debate analysis capabilities.

## Core Requirements

### Primary Goals
- **Real-time Audio Processing**: Live transcription and analysis of debate audio streams
- **Speaker Diarization**: Identify and track multiple speakers throughout debates
- **Claim Extraction**: Use LLM analysis to identify factual claims from transcribed speech
- **Automated Fact-checking**: Integrate Perplexity API for real-time claim verification
- **WebSocket Streaming**: Real-time data delivery to frontend clients
- **Batch Processing**: Support for uploaded debate videos with progress tracking

### Target Performance
- **Latency**: <10 seconds from speech to claim extraction
- **Throughput**: Handle 3+ concurrent live debate streams
- **Accuracy**: 95%+ transcription accuracy, 90%+ claim detection precision
- **Reliability**: 99.9% uptime during live events with graceful error recovery

### Success Criteria
- **Processing Speed**: Complete analysis pipeline under 30 seconds for 5-minute segments
- **Fact-check Quality**: Verifiable sources and confidence ratings for all claims
- **System Stability**: Zero data loss during WebSocket disconnections
- **Cost Efficiency**: Optimized API usage to maintain sustainable operational costs

## Technical Scope

### Core Features
1. **Audio Ingestion Pipeline**
   - Live microphone/HLS stream processing
   - YouTube video download and processing (existing capability)
   - Audio format conversion and optimization
   - Queue-based job management with BullMQ

2. **AI Processing Chain**
   - Real-time transcription (existing WhisperX integration)
   - Speaker diarization with pyannote.audio
   - LLM-based claim extraction (GPT-4o integration)
   - Fact-checking via Perplexity API (server-perplexity-ask MCP)

3. **Real-time Communication**
   - WebSocket server for live data streaming
   - Progress tracking and status updates
   - Error handling and connection recovery
   - Client synchronization and state management

4. **Data Management**
   - PostgreSQL database for debate metadata and results
   - Debate timeline and speaker tracking
   - Claim storage with fact-check results and sources
   - Historical analysis and export capabilities

### Technical Constraints
- **Platform**: Node.js/TypeScript with existing Fly.io + Modal Labs architecture
- **Database**: PostgreSQL (existing infrastructure)
- **GPU Processing**: Modal Labs for compute-intensive AI tasks
- **API Integration**: Perplexity API rate limits and cost management
- **Repository**: Separate GitHub repository from frontend, independent CI/CD

## Integration with Existing System

### Reused Components
- **ytDlpDownloader**: Multi-strategy YouTube audio extraction
- **WhisperXProcessor**: Word-level transcription with timestamps
- **Queue System**: BullMQ job management and progress tracking
- **Modal Integration**: GPU processing for AI workloads
- **WebSocket Infrastructure**: Real-time client communication

### New Components
- **DebateProcessor**: Orchestrates the complete analysis pipeline
- **SpeakerDiarizer**: Identifies and tracks speakers using pyannote.audio
- **ClaimExtractor**: LLM-powered extraction of factual claims
- **FactChecker**: Perplexity API integration for claim verification
- **DebateAPI**: REST endpoints for debate metadata and control

## Out of Scope
- **Video Processing**: Focus on audio analysis only
- **User Authentication**: Public API initially, auth to be added later
- **Content Moderation**: Focused on fact-checking, not content filtering
- **Multi-language Support**: English-only initially
- **Real-time Video Streaming**: Audio processing only

## Architecture Integration

### Hybrid Deployment Model
Following the proven YouTube transcription system pattern:
- **Fly.io**: API orchestration, WebSocket management, database operations
- **Modal Labs**: GPU-intensive AI processing (transcription, diarization, LLM)
- **PostgreSQL**: Debate metadata, claims, fact-check results
- **Redis**: BullMQ job queue and WebSocket session management

### Data Flow
```
Audio Input → Queue Job → Modal Processing → Database Storage → WebSocket Stream → Frontend
```

### Processing Pipeline
1. **Ingestion**: Audio stream/file received and queued
2. **Transcription**: WhisperX produces word-level timestamps
3. **Diarization**: Speaker identification and timeline creation
4. **Claim Extraction**: LLM analysis identifies factual claims
5. **Fact-checking**: Perplexity API verifies claims with sources
6. **Delivery**: Real-time streaming to connected clients 