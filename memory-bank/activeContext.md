# OnlyTruth Backend - Active Context

## Current Work Focus

### Phase: Architecture Design & Extension Planning
The backend is in the design phase, extending the proven YouTube transcription system to support real-time debate analysis. Current priority is defining the integration points and new components needed for the debate analysis pipeline.

### Immediate Goals
1. **Extend Existing System**: Build upon youtube-lyrics-backend architecture
2. **Database Schema**: Design debate-specific data models and relationships
3. **Modal Integration**: Extend existing Modal Labs functions for debate processing
4. **API Design**: Define REST and WebSocket endpoints for debate functionality

## Recent Changes
- **Memory Bank Setup**: Established complete documentation framework
- **Architecture Analysis**: Reviewed existing YouTube transcription system for reuse
- **Technology Stack Confirmation**: Validated Fly.io + Modal Labs + PostgreSQL approach
- **Integration Strategy**: Defined approach to extend rather than rebuild existing system

## Next Steps

### Week 1: Foundation & Schema
- [ ] **Database Design**
  - [ ] Create debate-specific tables extending existing schema
  - [ ] Design speaker tracking and claim storage models
  - [ ] Plan fact-check result storage with source attribution
  - [ ] Set up database migrations and seeding

- [ ] **API Architecture**
  - [ ] Extend existing Express routes for debate endpoints
  - [ ] Design WebSocket event structure for real-time streaming
  - [ ] Plan authentication and rate limiting strategies
  - [ ] Document API contracts for frontend integration

### Week 2: Core Processing Pipeline
- [ ] **Debate Processor**
  - [ ] Create DebateProcessor class extending existing job patterns
  - [ ] Implement audio segmentation for real-time processing
  - [ ] Design pipeline orchestration with error handling
  - [ ] Add progress tracking for multi-stage processing

- [ ] **Speaker Diarization**
  - [ ] Integrate pyannote.audio in Modal Labs environment
  - [ ] Create speaker identification and tracking logic
  - [ ] Design speaker consistency across audio segments
  - [ ] Implement speaker timeline generation

### Week 3: AI Integration
- [ ] **Claim Extraction**
  - [ ] Implement LLM integration for claim identification
  - [ ] Design prompt engineering for optimal claim detection
  - [ ] Create claim confidence scoring and categorization
  - [ ] Add claim context preservation and attribution

- [ ] **Fact-checking Integration**
  - [ ] Integrate server-perplexity-ask MCP tool
  - [ ] Design query formation and source verification
  - [ ] Implement result caching and rate limiting
  - [ ] Create source credibility scoring system

## Active Decisions

### Technology Stack Extensions
- **Base System**: Extend existing youtube-lyrics-backend architecture
- **New Modal Functions**: Add debate-specific GPU processing alongside existing functions
- **Database**: Extend existing PostgreSQL schema with debate-specific tables
- **Queue System**: Leverage existing BullMQ setup with new job types
- **WebSocket**: Extend existing WebSocket infrastructure for debate streaming

### Architecture Patterns
- **Extension Over Rebuild**: Maximize reuse of existing, proven components
- **Incremental Migration**: Add debate features alongside existing YouTube processing
- **Shared Infrastructure**: Use same Fly.io deployment with feature flags
- **Modular Design**: New components integrate cleanly with existing patterns

### Processing Strategy
- **Hybrid Processing**: Live streams + batch video processing using existing infrastructure
- **Pipeline Reuse**: Leverage existing audio processing and transcription pipeline
- **Modal Extensions**: Add new GPU functions while maintaining existing transcription capability
- **Progressive Enhancement**: Start with basic features, add advanced AI gradually

## Important Considerations

### Performance Requirements
- **Real-time Constraints**: Must process audio faster than real-time for live debates
- **Concurrent Processing**: Support multiple debate streams without resource conflicts
- **Cost Management**: Optimize AI API usage through intelligent batching and caching
- **Memory Management**: Handle long debates without memory leaks or performance degradation

### Integration Challenges
- **Existing System Compatibility**: Ensure new features don't break YouTube processing
- **Database Migration**: Safely extend schema without disrupting existing functionality
- **Modal Labs Coordination**: Add new functions while maintaining existing GPU pipeline
- **WebSocket Scaling**: Handle increased connection load from debate viewers

### Development Priorities
- **Stability First**: Maintain reliability of existing YouTube transcription system
- **Incremental Delivery**: Ship basic debate features quickly, iterate on advanced AI
- **Error Recovery**: Robust handling of AI service failures and network issues
- **Monitoring & Observability**: Comprehensive logging and metrics for new pipeline stages

## Reusable Assets from Existing System

### Proven Components
- **ytDlpDownloader**: Multi-strategy audio extraction (works for uploaded debate videos)
- **WhisperXProcessor**: Word-level transcription with precise timestamps
- **ModalClient**: GPU processing orchestration and error handling
- **WebSocketManager**: Real-time client communication and connection management
- **Queue Worker**: Job processing with progress tracking and error recovery

### Database Infrastructure
- **Connection Management**: Existing PostgreSQL setup and connection pooling
- **Migration System**: Established pattern for schema changes
- **Backup Strategy**: Proven data protection and recovery procedures
- **Performance Monitoring**: Existing query optimization and monitoring tools

### Deployment Pipeline
- **Fly.io Configuration**: Established deployment and scaling patterns
- **Environment Management**: Secrets handling and configuration management
- **Health Checks**: Proven monitoring and alerting systems
- **CI/CD**: Automated testing and deployment workflows

## New Component Integration Points

### DebateProcessor Integration
```typescript
// Extends existing job processing patterns
class DebateProcessor extends BaseProcessor {
  async processDebate(audioInput: AudioInput): Promise<DebateResult> {
    // Leverage existing audio processing
    const transcription = await this.whisperXProcessor.process(audioInput);
    
    // Add new speaker identification
    const speakers = await this.speakerDiarizer.identify(audioInput, transcription);
    
    // Add new claim extraction
    const claims = await this.claimExtractor.extract(transcription, speakers);
    
    // Add new fact-checking
    const factChecks = await this.factChecker.verify(claims);
    
    return { transcription, speakers, claims, factChecks };
  }
}
```

### Modal Function Extensions
```python
# Add to existing Modal app alongside youtube-transcription function
@app.function(gpu="A10G", timeout=300)
def analyze_debate_segment(audio_data: bytes, transcript: str) -> DebateAnalysis:
    # Reuse existing audio processing setup
    # Add speaker diarization
    # Add claim extraction
    # Return structured analysis
```

### Database Schema Extensions
```sql
-- Extend existing schema
CREATE TABLE debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Reuse existing job tracking patterns
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0
);

-- Link to existing transcription results
CREATE TABLE debate_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES debates(id),
  -- Link to existing audio processing results
  audio_url TEXT,
  transcription_result JSONB
);
```

## Development Preferences
- **Code Reuse**: Maximize leveraging of existing, battle-tested components
- **Incremental Testing**: Test new features alongside existing functionality
- **Feature Flags**: Deploy debate features behind toggles for safe rollout
- **Documentation**: Maintain clear distinction between existing and new functionality
- **Version Compatibility**: Ensure new changes don't break existing API contracts 