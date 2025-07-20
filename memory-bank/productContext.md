# OnlyTruth Backend - Product Context

## Why This Backend Exists

### Problem Statement
Real-time fact-checking during live debates requires sophisticated AI processing that cannot be performed in browsers. Current fact-checking solutions operate manually or post-event, missing the critical window when audiences form opinions during live discussions.

### Technical Challenge
The backend solves several complex technical problems:
- **Real-time AI Processing**: Requires GPU acceleration for transcription and LLM analysis
- **Multi-step Pipeline**: Orchestrates transcription → diarization → claim extraction → fact-checking
- **Stream Processing**: Handles continuous audio input with minimal latency
- **Cost Optimization**: Manages expensive AI API usage efficiently
- **Scalability**: Supports multiple concurrent debate streams

### Business Value
- **Real-time Insights**: Enables immediate fact-checking during live events
- **Scalable Processing**: Handles multiple debates simultaneously
- **Cost-Effective**: Optimizes AI API usage through intelligent batching
- **Reliable Infrastructure**: Built on proven YouTube transcription architecture

## How It Should Work

### Core Processing Philosophy
1. **Pipeline Efficiency**: Each stage optimizes for minimal latency while maintaining accuracy
2. **Graceful Degradation**: System continues with reduced features if components fail
3. **Resource Management**: Intelligent queuing and batching to optimize GPU and API usage
4. **Real-time First**: Architecture prioritizes streaming over batch processing

### Data Processing Flow

#### 1. Audio Ingestion
```
Live Stream/Upload → Audio Validation → Format Conversion → Queue Job
```
- **Live Input**: HLS streams, WebRTC audio, or direct microphone input
- **Batch Input**: Uploaded video/audio files via existing ytDlpDownloader
- **Validation**: Audio quality checks and format standardization
- **Queueing**: BullMQ job creation with priority and resource allocation

#### 2. Transcription Pipeline
```
Audio Segments → WhisperX Processing → Word-level Timestamps → Speaker Alignment
```
- **Segmentation**: Split audio into 30-second chunks for parallel processing
- **Transcription**: Leverage existing Modal Labs WhisperX integration
- **Timing**: Precise word-level timestamps for claim attribution
- **Quality**: Confidence scoring and error detection

#### 3. Speaker Diarization
```
Audio + Transcription → Pyannote.audio → Speaker Segments → Timeline Creation
```
- **Identification**: Distinguish between speakers in the audio
- **Timeline**: Create speaker-attributed transcript segments
- **Consistency**: Maintain speaker identity across segments
- **Metadata**: Associate claims with specific speakers

#### 4. Claim Extraction
```
Speaker Segments → LLM Analysis → Factual Claims → Confidence Scoring
```
- **LLM Processing**: GPT-4o analysis to identify factual statements
- **Claim Types**: Distinguish between facts, opinions, and predictions
- **Context**: Maintain relationship between claims and surrounding discussion
- **Prioritization**: Focus on verifiable, significant claims

#### 5. Fact-checking
```
Claims → Perplexity API → Evidence Gathering → Source Verification → Results
```
- **Query Formation**: Convert claims into searchable fact-check queries
- **Source Gathering**: Collect evidence from reliable sources
- **Verification**: Determine claim accuracy with confidence levels
- **Attribution**: Provide clear source citations and credibility ratings

### Real-time Streaming Architecture

#### WebSocket Communication
```
Processing Updates → WebSocket Server → Client Broadcasting → Frontend Updates
```
- **Connection Management**: Handle client connections, disconnections, and reconnections
- **Message Types**: Status updates, transcription chunks, claims, fact-checks
- **State Synchronization**: Ensure clients receive complete data sets
- **Error Recovery**: Graceful handling of connection drops

#### Progress Tracking
```
Job Stages → Progress Calculation → Status Broadcasting → User Feedback
```
- **Stage Tracking**: Monitor progress through each processing step
- **Time Estimates**: Provide realistic completion time predictions
- **Error Reporting**: Clear communication of failures and recovery attempts
- **User Control**: Allow pause/resume/cancel operations

### Data Management Strategy

#### Database Schema
```sql
-- Core entities
debates (id, title, start_time, status, metadata)
speakers (id, debate_id, name, identifier, voice_profile)
segments (id, debate_id, speaker_id, start_time, end_time, text)
claims (id, segment_id, text, type, confidence, fact_check_status)
fact_checks (id, claim_id, verdict, confidence, sources, timestamp)
```

#### Caching Strategy
- **Redis**: Session management, WebSocket state, temporary processing data
- **Database**: Persistent debate data, historical analysis results
- **Memory**: Hot path data for active debates
- **CDN**: Static assets and cached fact-check results

### API Design Principles

#### RESTful Endpoints
```typescript
// Debate management
POST /api/debates          // Create new debate analysis
GET /api/debates/:id       // Retrieve debate results
GET /api/debates/:id/claims // Get all claims for debate

// Live processing
POST /api/debates/:id/audio // Submit audio chunk
GET /api/debates/:id/status // Get current processing status

// Historical data
GET /api/claims/search     // Search historical claims
GET /api/speakers/:id      // Speaker analysis across debates
```

#### WebSocket Events
```typescript
// Client → Server
'join-debate': { debateId: string }
'audio-chunk': { debateId: string, audio: Buffer }
'pause-processing': { debateId: string }

// Server → Client
'transcription-update': { segmentId: string, text: string, speaker: string }
'claim-detected': { claimId: string, text: string, confidence: number }
'fact-check-result': { claimId: string, verdict: string, sources: Source[] }
'processing-progress': { stage: string, percentage: number, eta: number }
```

### Performance Requirements

#### Latency Targets
- **Transcription**: <5 seconds from audio to text
- **Speaker ID**: <2 seconds additional processing
- **Claim Extraction**: <10 seconds for LLM analysis
- **Fact-checking**: <15 seconds for Perplexity API results
- **Total Pipeline**: <30 seconds from speech to verified fact-check

#### Throughput Goals
- **Concurrent Debates**: 3-5 simultaneous live streams
- **Audio Processing**: 10x real-time (process 10 minutes in 1 minute)
- **API Efficiency**: Batch claims to minimize Perplexity API calls
- **Database Performance**: <100ms query response times

### Error Handling Philosophy

#### Graceful Degradation
1. **Transcription Failure**: Continue with degraded accuracy, notify users
2. **Diarization Failure**: Process without speaker attribution
3. **Claim Extraction Failure**: Manual claim flagging interface
4. **Fact-check API Failure**: Queue for retry, show pending status
5. **Database Issues**: Cache operations, sync when recovered

#### Recovery Strategies
- **Automatic Retry**: Exponential backoff for transient failures
- **Manual Intervention**: Clear interfaces for human oversight
- **State Recovery**: Resume processing from last successful checkpoint
- **Client Notification**: Transparent communication about system status 