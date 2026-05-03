## ADDED Requirements

### Requirement: Turn-based microphone capture

The system SHALL capture user speech as a turn-based answer rather than requiring free-running real-time conversation.

#### Scenario: User records an answer

- **WHEN** the user starts recording in an active interview
- **THEN** the system enters a listening state
- **AND** captures microphone audio until the user stops recording or the configured maximum answer duration is reached

#### Scenario: Recording permission denied

- **WHEN** microphone permission is denied
- **THEN** the system displays a recoverable permission error
- **AND** allows the user to continue with text input fallback for development and emergency demo recovery

### Requirement: Audio chunking

The system SHALL split a single user answer into model-safe audio chunks before speech understanding.

#### Scenario: Answer is shorter than chunk limit

- **WHEN** the captured user answer is shorter than the configured chunk duration
- **THEN** the system sends one audio chunk for speech understanding

#### Scenario: Answer exceeds chunk limit

- **WHEN** the captured user answer exceeds the configured chunk duration
- **THEN** the system splits the answer into multiple chunks
- **AND** no chunk sent to Gemma audio understanding exceeds 30 seconds
- **AND** the session continues processing the full answer rather than rejecting it because of the per-request limit

#### Scenario: Chunk overlap configured

- **WHEN** multiple chunks are produced from one answer
- **THEN** adjacent chunks may include a short overlap
- **AND** transcript stitching removes duplicated overlap text from the final answer transcript

### Requirement: Speech understanding result stitching

The system SHALL combine speech understanding results from one or more chunks into a single user turn transcript.

#### Scenario: Gemma speech provider enabled

- **WHEN** the app is configured to use Gemma speech understanding
- **THEN** the speech understanding provider sends each audio chunk to the internal speech understanding route
- **AND** the internal route forwards the chunk to the configured Gemma speech service
- **AND** the returned transcript is used as the chunk transcript

#### Scenario: Gemma speech service unavailable

- **WHEN** the Gemma speech provider is enabled but the service is missing or unavailable
- **THEN** the system surfaces a recoverable speech understanding error
- **AND** does not append a partial user answer transcript

#### Scenario: Multiple chunk transcripts complete

- **WHEN** all chunks for one user answer are understood
- **THEN** the system produces one consolidated transcript for the user turn
- **AND** appends one user turn to the conversation
- **AND** stores chunk-level metadata separately from the user-visible transcript

#### Scenario: One chunk fails

- **WHEN** one chunk fails during speech understanding
- **THEN** the system marks the answer processing as failed
- **AND** allows the user to retry the answer
- **AND** does not append a partial user turn as final transcript

### Requirement: Interviewer speech playback

The system SHALL play interviewer questions and follow-ups as speech output.

#### Scenario: Speech output succeeds

- **WHEN** the interviewer produces a text response
- **THEN** the system requests speech output for that response
- **AND** plays the generated audio for the user
- **AND** shows the same response text in the transcript
- **AND** waits for playback to finish before accepting the user's next answer

#### Scenario: User replays interviewer speech

- **WHEN** an interviewer turn has generated speech output
- **THEN** the user can replay the latest interviewer audio
- **AND** the system returns to the ready state after replay finishes

#### Scenario: Speech output fails

- **WHEN** speech output generation or playback fails
- **THEN** the system keeps the interviewer text visible
- **AND** shows a recoverable playback error
- **AND** allows the user to continue the interview
