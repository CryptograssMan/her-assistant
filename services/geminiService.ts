import type { LiveServerMessage } from '../types';

// This is not the Blob from @google/genai, but a simple structure for our use case.
interface PcmBlob {
    data: string;
    mimeType: string;
}


// --- Audio Helper Functions (remain on client) ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createPcmBlob(data: Float32Array): PcmBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


// --- Gemini Live API Service (Refactored to use WebSocket) ---

interface LiveSessionCallbacks {
  onMessage: (message: LiveServerMessage) => void;
  onError: (e: Event) => void;
  onClose: () => void;
}

interface StartConversationParams extends LiveSessionCallbacks {
    stream: MediaStream;
    vips: string[];
}

export interface LiveSession {
  close: () => void;
}

let inputAudioContext: AudioContext;
let outputAudioContext: AudioContext;
let microphoneStream: MediaStream;
let scriptProcessor: ScriptProcessorNode;
let mediaStreamSource: MediaStreamAudioSourceNode;
let webSocket: WebSocket;

let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

const stopAudioProcessing = () => {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
    microphoneStream = (null as unknown as MediaStream);
  }
  if (scriptProcessor) {
    scriptProcessor.disconnect();
    scriptProcessor = (null as unknown as ScriptProcessorNode);
  }
  if(mediaStreamSource) {
    mediaStreamSource.disconnect();
    mediaStreamSource = (null as unknown as MediaStreamAudioSourceNode);
  }
  if (inputAudioContext && inputAudioContext.state !== 'closed') {
    inputAudioContext.close();
  }
  if (outputAudioContext && outputAudioContext.state !== 'closed') {
    outputAudioContext.close();
  }
};


export const startConversation = async (params: StartConversationParams): Promise<LiveSession> => {
  const { onMessage, onError, onClose, stream, vips } = params;

  // Initialize audio contexts
  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);

  microphoneStream = stream;

  // Setup WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  webSocket = new WebSocket(`${protocol}//${window.location.host}/api/gemini/live`);

  webSocket.onerror = onError;
  webSocket.onclose = () => {
    stopAudioProcessing();
    onClose();
  };

  webSocket.onopen = () => {
    // Send initial configuration to the backend
    webSocket.send(JSON.stringify({ type: 'start', vips }));

    // Start processing microphone audio
    mediaStreamSource = inputAudioContext.createMediaStreamSource(microphoneStream);
    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        if (webSocket.readyState === WebSocket.OPEN) {
            // Send audio data to the backend
            webSocket.send(JSON.stringify({ type: 'audio', data: pcmBlob.data }));
        }
    };
    mediaStreamSource.connect(scriptProcessor);
    scriptProcessor.connect(inputAudioContext.destination);
  };
  
  webSocket.onmessage = async (event) => {
    const message: LiveServerMessage = JSON.parse(event.data);
    onMessage(message); // Forward transcript messages to UI

    // Handle audio playback
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        source.addEventListener('ended', () => {
            sources.delete(source);
        });
        source.start(nextStartTime);
        nextStartTime = nextStartTime + audioBuffer.duration;
        sources.add(source);
    }

    if (message.serverContent?.interrupted) {
        for (const source of sources.values()) {
            source.stop();
        }
        sources.clear();
        nextStartTime = 0;
    }
  };


  return {
    close: () => {
      if (webSocket.readyState === WebSocket.OPEN || webSocket.readyState === WebSocket.CONNECTING) {
        webSocket.close();
      }
      stopAudioProcessing();
    }
  };
};
