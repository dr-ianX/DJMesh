# DJMesh Client.js Fixes TODO

## Critical Issues to Fix

### 1. AudioContext Creation Issues
- [ ] Consolidate AudioContext creation in one place
- [ ] Add proper error handling for AudioContext creation
- [ ] Ensure AudioContext is only created after user interaction on mobile
- [ ] Fix multiple AudioContext instances being created

### 2. Memory Leaks - Event Listeners
- [ ] Add removeEventListener calls for all event listeners
- [ ] Implement proper cleanup in destroy methods
- [ ] Fix touch event listeners that aren't being removed
- [ ] Add event listener cleanup when components are destroyed

### 3. Mobile Touch Event Handling
- [ ] Fix touch event listeners to prevent memory leaks
- [ ] Add proper touch event cleanup
- [ ] Ensure touch events work correctly on all mobile devices
- [ ] Add passive event listeners where appropriate

### 4. WebSocket Reconnection Logic
- [ ] Improve reconnection strategy with exponential backoff
- [ ] Add better error handling for connection failures
- [ ] Implement connection state management
- [ ] Add timeout handling for reconnection attempts

### 5. Audio Player Mobile Initialization
- [ ] Delay audio initialization until user interaction
- [ ] Fix audio loading issues on mobile browsers
- [ ] Add proper audio context resumption
- [ ] Ensure audio works after page reload on mobile

### 6. General Code Quality
- [ ] Add proper error boundaries
- [ ] Implement cleanup methods for all classes
- [ ] Fix any remaining memory leaks
- [ ] Add proper logging for debugging

## Implementation Plan

1. **Phase 1**: Fix AudioContext and audio initialization issues
2. **Phase 2**: Implement proper event listener cleanup
3. **Phase 3**: Improve WebSocket reconnection logic
4. **Phase 4**: Fix mobile-specific issues
5. **Phase 5**: Add general cleanup and error handling
6. **Phase 6**: Test all fixes thoroughly

## Testing Checklist

- [ ] Test on multiple mobile devices (iOS Safari, Android Chrome)
- [ ] Test WebSocket reconnection on network interruptions
- [ ] Test audio playback on mobile after user interaction
- [ ] Test memory usage over time (no leaks)
- [ ] Test touch events on mobile devices
- [ ] Test error handling for all edge cases
