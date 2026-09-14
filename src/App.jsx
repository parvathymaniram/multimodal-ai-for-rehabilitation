import React, { useState, useRef, useEffect } from 'react';

const BACKEND = 'http://127.0.0.1:5000';

function WaveformBars({ active }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'3px', height:'36px', padding:'0 8px' }}>
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          width:'3px', borderRadius:'2px',
          background: active ? '#4f8ef7' : '#2a3a5c',
          height: active ? `${10 + Math.abs(Math.sin(i * 0.8)) * 22}px` : '6px',
          animationName: active ? 'wave' : 'none',
          animationDuration: `${0.6 + (i % 5) * 0.15}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationDelay: `${i * 0.05}s`,
          transition: 'height 0.3s ease',
        }}/>
      ))}
    </div>
  );
}

export default function KneeAssist() {
  const [messages, setMessages] = useState([{
    role: 'agent',
    text: "Hello! I'm KneeAssist, your post-operative knee rehabilitation assistant. How can I help you today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (override) => {
    const text = (override || input).trim();
    if (!text || isLoading || isGenerating) return;

    setMessages(p => [...p, { role: 'user', text, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setShowVideo(false);

    try {
      const res = await fetch(`${BACKEND}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
      });
      const data = await res.json();
      const reply = data.text || 'Sorry, could not process that.';
      const audioUrl = data.audio;

      setMessages(p => [...p, { role: 'agent', text: reply, timestamp: new Date() }]);
      setIsLoading(false);

      if (!audioUrl) return;

      setIsGenerating(true);
      try {
        const audioBlob = await (await fetch(`${BACKEND}${audioUrl}`)).blob();
        const fd = new FormData();
        fd.append('audio', audioBlob, 'tts.mp3');

        const resp = await fetch(`${BACKEND}/wav2lip`, { method: 'POST', body: fd });
        if (!resp.ok) throw new Error(`${resp.status}`);

        const videoBlob = await resp.blob();
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(videoBlob);
        blobUrlRef.current = url;

        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.load();
          videoRef.current.oncanplaythrough = () => {
            setIsGenerating(false);
            setShowVideo(true);
            setIsSpeaking(true);
            videoRef.current.play().catch(e => console.warn('Play:', e));
          };
          videoRef.current.onended = () => {
            setShowVideo(false);
            setIsSpeaking(false);
          };
          videoRef.current.onerror = () => setIsGenerating(false);
        }
      } catch (e) {
        console.warn('Avatar generation error:', e.message);
        setIsGenerating(false);
      }

    } catch {
      setIsLoading(false);
      setIsGenerating(false);
      setMessages(p => [...p, {
        role: 'agent',
        text: 'Connection error. Is backend running on port 5000?',
        timestamp: new Date()
      }]);
    }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input.'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onresult = e => { setIsListening(false); handleSend(e.results[0][0].transcript); };
    r.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'not-allowed') alert('Allow mic: click 🔒 → Microphone → Allow');
    };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const suggested = ['What exercises can I do?', 'How much swelling is normal?', 'When can I walk without crutches?'];
  const statusLabel = isGenerating ? '⚙ Preparing response...'
    : isSpeaking ? '🔊 Speaking...'
    : isListening ? '🎤 Listening...'
    : isLoading ? '⏳ Thinking...'
    : '● Online';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0b1120;font-family:'DM Sans',sans-serif;overflow:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#2a3a5c;border-radius:2px;}
        @keyframes wave{from{transform:scaleY(0.4);}to{transform:scaleY(1);}}
        @keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(79,142,247,0.5);}70%{box-shadow:0 0 0 14px rgba(79,142,247,0);}100%{box-shadow:0 0 0 0 rgba(79,142,247,0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .msg-in{animation:fadeIn 0.3s ease;}
        .typing-dot{width:7px;height:7px;border-radius:50%;background:#4f8ef7;animation:bounce 1.2s infinite;display:inline-block;margin:0 2px;}
        .typing-dot:nth-child(2){animation-delay:.2s;}
        .typing-dot:nth-child(3){animation-delay:.4s;}
        @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
        .send-btn:hover:not(:disabled){background:#3a7be0!important;}
        .suggest-btn:hover:not(:disabled){background:#1a2740!important;border-color:#4f8ef7!important;}
        .mic-btn:hover:not(:disabled){background:#1a2740!important;}
        input:focus{border-color:#4f8ef7!important;outline:none;}
      `}</style>

      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#0b1120',color:'#e2e8f0'}}>

        <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 24px',background:'#0f172a',borderBottom:'1px solid #1e2d4a',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:38,height:38,borderRadius:'10px',background:'linear-gradient(135deg,#4f8ef7,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🦴</div>
            <div>
              <div style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:'17px',color:'#f1f5f9'}}>KneeAssist</div>
              <div style={{fontSize:'11px',color:'#64748b'}}>Post-Operative Rehabilitation Assistant</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:isSpeaking?'#22c55e':isGenerating?'#f59e0b':isListening?'#f59e0b':'#4f8ef7',animation:(isSpeaking||isListening||isGenerating)?'pulse-ring 1.5s infinite':'none'}}/>
            <span style={{fontSize:'12px',color:'#94a3b8'}}>{statusLabel}</span>
          </div>
        </header>

        <div style={{display:'flex',flex:1,overflow:'hidden'}}>

          <div style={{width:'260px',flexShrink:0,background:'#0f172a',borderRight:'1px solid #1e2d4a',display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 16px',gap:'16px'}}>

            <div style={{position:'relative'}}>
              <div style={{
                width:160,height:160,borderRadius:'50%',overflow:'hidden',
                border:isSpeaking?'3px solid #4f8ef7':'3px solid #1e2d4a',
                boxShadow:isSpeaking?'0 0 0 6px rgba(79,142,247,0.2)':'none',
                transition:'all 0.4s ease',position:'relative',background:'#141e33',
              }}>
                {/* Real photo — idle state */}
                <img
                  src="/myphoto_new.jpeg"
                  alt="Dr. KneeAssist"
                  style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0,opacity:showVideo?0:1,transition:'opacity 0.3s ease'}}
                />
                {/* AI-generated lip sync video — no badge, no label */}
                <video
                  ref={videoRef}
                  playsInline
                  style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0,opacity:showVideo?1:0,transition:'opacity 0.3s ease'}}
                />
              </div>

              {/* Spinner while generating — no text that reveals technology */}
              {isGenerating && (
                <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'rgba(11,17,32,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',border:'3px solid #4f8ef7',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/>
                </div>
              )}
            </div>

            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Space Grotesk',fontWeight:600,fontSize:'16px',color:'#f1f5f9'}}>Dr. KneeAssist</div>
              <div style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>Rehab Specialist AI</div>
            </div>

            <div style={{width:'100%',background:'#141e33',borderRadius:'10px',padding:'4px 0',border:'1px solid #1e2d4a'}}>
              <WaveformBars active={isSpeaking} />
            </div>

            <div style={{fontSize:'10px',color:'#475569',textAlign:'center',padding:'8px 12px',background:'#141e33',borderRadius:'8px',border:'1px solid #1e2d4a',lineHeight:1.5}}>
              ⚕ Not a substitute for professional medical advice.
            </div>

            <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'6px'}}>
              {suggested.map((s,i)=>(
                <button key={i} className="suggest-btn" onClick={()=>handleSend(s)}
                  disabled={isLoading||isGenerating||isSpeaking}
                  style={{width:'100%',textAlign:'left',padding:'7px 12px',borderRadius:'8px',fontSize:'12px',background:'#0f172a',color:'#94a3b8',border:'1px solid #1e2d4a',cursor:'pointer',transition:'all 0.2s',opacity:(isLoading||isGenerating||isSpeaking)?0.4:1}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:'16px'}}>
              {messages.map((msg,i)=>(
                <div key={i} className="msg-in" style={{display:'flex',flexDirection:msg.role==='user'?'row-reverse':'row',alignItems:'flex-end',gap:'10px'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:'2px solid #1e2d4a',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {msg.role==='agent'
                      ?<img src="/myphoto_new.jpeg" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      :<span style={{fontSize:'14px'}}>👤</span>}
                  </div>
                  <div style={{maxWidth:'65%'}}>
                    <div style={{padding:'12px 16px',borderRadius:'16px',borderBottomRightRadius:msg.role==='user'?'4px':'16px',borderBottomLeftRadius:msg.role==='agent'?'4px':'16px',background:msg.role==='user'?'linear-gradient(135deg,#1e3a8a,#1e40af)':'#141e33',border:`1px solid ${msg.role==='user'?'#2563eb44':'#1e2d4a'}`,fontSize:'14px',lineHeight:1.6,color:'#e2e8f0'}}>
                      {msg.text}
                    </div>
                    <div style={{fontSize:'10px',color:'#475569',marginTop:'4px',textAlign:msg.role==='user'?'right':'left'}}>
                      {msg.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}

              {(isLoading||isGenerating)&&(
                <div className="msg-in" style={{display:'flex',alignItems:'flex-end',gap:'10px'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',overflow:'hidden',border:'2px solid #1e2d4a',flexShrink:0}}>
                    <img src="/myphoto_new.jpeg" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                  <div style={{padding:'12px 16px',borderRadius:'16px',borderBottomLeftRadius:'4px',background:'#141e33',border:'1px solid #1e2d4a',display:'flex',alignItems:'center',gap:'10px'}}>
                    {isGenerating
                      ?<><div style={{width:14,height:14,borderRadius:'50%',border:'2px solid #4f8ef7',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/><span style={{fontSize:'13px',color:'#4f8ef7'}}>Preparing avatar response...</span></>
                      :<><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></>
                    }
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            <div style={{padding:'0 24px 10px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {suggested.map((s,i)=>(
                <button key={i} className="suggest-btn" onClick={()=>handleSend(s)}
                  disabled={isLoading||isGenerating||isSpeaking}
                  style={{padding:'6px 14px',borderRadius:'20px',fontSize:'12px',background:'#0f172a',color:'#94a3b8',border:'1px solid #1e2d4a',cursor:'pointer',transition:'all 0.2s',opacity:(isLoading||isGenerating||isSpeaking)?0.4:1}}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{padding:'12px 24px 16px',borderTop:'1px solid #1e2d4a',background:'#0f172a'}}>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <button className="mic-btn" onClick={toggleVoice} disabled={isLoading||isGenerating}
                  style={{width:44,height:44,borderRadius:'12px',border:'none',cursor:'pointer',background:isListening?'#ef4444':'#141e33',fontSize:'20px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',animation:isListening?'pulse-ring 1.5s infinite':'none'}}>
                  {isListening?'🔴':'🎤'}
                </button>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}}
                  placeholder={isListening?'🎤 Listening...':isGenerating?'Please wait...':'Ask about your knee recovery...'}
                  disabled={isLoading||isListening||isGenerating}
                  style={{flex:1,padding:'12px 18px',borderRadius:'12px',background:'#141e33',border:'1px solid #1e2d4a',color:'#e2e8f0',fontSize:'14px',fontFamily:'DM Sans',transition:'border-color 0.2s'}}
                />
                <button className="send-btn" onClick={()=>handleSend()}
                  disabled={isLoading||!input.trim()||isGenerating}
                  style={{padding:'12px 22px',borderRadius:'12px',border:'none',background:'#4f8ef7',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',flexShrink:0,opacity:(!input.trim()||isLoading||isGenerating)?0.5:1,transition:'all 0.2s',fontFamily:'DM Sans'}}>
                  Send ➤
                </button>
              </div>
              <p style={{fontSize:'11px',color:'#334155',marginTop:'8px',textAlign:'center'}}>
                🎤 Voice input &nbsp;·&nbsp; 🤖 AI Response &nbsp;·&nbsp; 🔊 Synchronized avatar
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}