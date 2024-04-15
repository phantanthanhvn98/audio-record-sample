import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [recording, setRecording] = useState<number[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const context = new AudioContext();
      setAudioContext(context);
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1); // buffer size, input channels, output channels
      processor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0); // Get audio data from the input buffer
        setRecording(prevRecording => [...prevRecording, ...Array.from(data)]); // Append audio data to the recording array
      };
      source.connect(processor);
      processor.connect(context.destination);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setRecording([])
  };

  useEffect(() => {
    return () => {
      stopRecording(); // Stop recording when component unmounts
    };
  }, []);

  return (
    <div className='flex flex-col p-10 gap-28'>
      <div className='flex gap-10'>
        <button className='bg-green-500 w-64 h-10 flex items-center rounded-md p-4 justify-center' onClick={startRecording}>Start Recording</button>
        <button className='bg-red-500 w-64 h-10 flex items-center rounded-md p-4 justify-center' onClick={stopRecording}>Stop Recording</button>
      </div>
      <div className='flex text-[30px] font-[700]'>
        Recording Array Length: {recording.length} 
      </div>
    </div>
  );
};

export default App;