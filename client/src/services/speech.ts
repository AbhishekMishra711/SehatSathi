/**
 * Senior Care Voice Synthesizer
 * Uses Indian English / Hindi accent voices with calm, gentle pacing (0.82x)
 * suitable for elderly hearing comprehension.
 */
export function speakText(text: string): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  // Detect whether text is Hindi (Devanagari) or Hinglish/Indian English
  const isDevanagari = /[\u0900-\u097F]/.test(text);
  const isHinglish = /\b(aap|aapki|dawai|dawa|kripya|subah|shaam|pani|khana|doctor|namaste|samay|le|lena)\b/i.test(text);

  // Elder-friendly pace: 0.82 ensures clear articulation without rushing
  utterance.rate = 0.82;
  utterance.pitch = 1.02;

  const voices = window.speechSynthesis.getVoices();

  if (isDevanagari) {
    utterance.lang = 'hi-IN';
    const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('kalpana'));
    if (hindiVoice) utterance.voice = hindiVoice;
  } else if (isHinglish) {
    // For Hinglish, an Indian English or Hindi voice sounds significantly more natural than American voices
    utterance.lang = 'en-IN';
    const indianVoice = voices.find(v => 
      v.lang.includes('en-IN') || 
      v.lang.includes('hi-IN') || 
      v.name.toLowerCase().includes('india') || 
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('heera') ||
      v.name.toLowerCase().includes('ravi')
    );
    if (indianVoice) utterance.voice = indianVoice;
  } else {
    // English query
    utterance.lang = 'en-IN';
    const englishVoice = voices.find(v => 
      v.lang.includes('en-IN') || 
      v.lang.includes('en-GB') || 
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('natural')
    );
    if (englishVoice) utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError?: (err: string) => void
) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  // Support Indian English / Hinglish speech recognition by default
  recognition.lang = 'en-IN';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  return recognition;
}
