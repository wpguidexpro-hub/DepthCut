import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Upload,Undo2,Redo2,Save,Download,Trash2,Plus,Play,Pause,SkipBack,SkipForward,Scissors,Type,Music,Film,Layers,Settings,Volume2,VolumeX,Maximize2} from 'lucide-react';
import './styles.css';

const tools=[['Media',Upload],['Text',Type],['Audio',Music],['Effects',Layers]];
const kind=f=>f.type.startsWith('video/')?'video':f.type.startsWith('image/')?'image':f.type.startsWith('audio/')?'audio':'file';
const fmt=s=>{s=Math.max(0,Number(s)||0);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`};

function App(){
 const [active,setActive]=useState('Media'),[assets,setAssets]=useState([]),[selected,setSelected]=useState(null),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[durations,setDurations]=useState({}),[muted,setMuted]=useState(false),[project,setProject]=useState('Untitled Project'),[text,setText]=useState('');
 const input=useRef(),video=useRef(),audio=useRef(),raf=useRef();
 const sel=assets.find(a=>a.id===selected)||assets.find(a=>a.kind==='video')||assets[0];
 const d=sel?.kind==='image'?5:(durations[sel?.id]||sel?.duration||5);
 const addFiles=e=>{const files=[...e.target.files||[]];if(!files.length)return;const next=files.map(f=>({id:crypto.randomUUID(),name:f.name,type:f.type,size:f.size,kind:kind(f),url:URL.createObjectURL(f),duration:f.type.startsWith('image/')?5:0,start:0,end:0}));setAssets(a=>[...a,...next]);setSelected(next[0].id);e.target.value=''};
 const remove=id=>{setAssets(a=>{const x=a.find(v=>v.id===id);if(x?.url)URL.revokeObjectURL(x.url);return a.filter(v=>v.id!==id)});if(selected===id){setSelected(null);setPlaying(false)}};
 const choose=id=>{video.current?.pause();audio.current?.pause();setPlaying(false);setTime(0);setSelected(id)};
 const toggle=()=>{if(!sel)return;if(sel.kind==='video'){if(!video.current)return;playing?video.current.pause():video.current.play().catch(()=>{});setPlaying(!playing)}else if(sel.kind==='audio'){if(!audio.current)return;playing?audio.current.pause():audio.current.play().catch(()=>{});setPlaying(!playing)}else setPlaying(!playing)};
 const seek=e=>{const r=e.currentTarget.getBoundingClientRect(),t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*d;setTime(t);if(video.current&&sel?.kind==='video')video.current.currentTime=t;if(audio.current&&sel?.kind==='audio')audio.current.currentTime=t};
 const onMeta=e=>{const value=e.currentTarget.duration||5;setDurations(x=>({...x,[sel?.id]:value}));setAssets(a=>a.map(v=>v.id===sel?.id?{...v,duration:value,end:value}:v))};
 const addText=()=>{const value=text.trim()||'Your Text';const id=crypto.randomUUID();setAssets(a=>[...a,{id,name:value,type:'text',size:0,kind:'text',url:null,duration:5,start:0,end:5,text:value}]);setSelected(id);setText('')};
 useEffect(()=>{if(video.current)video.current.muted=muted;if(audio.current)audio.current.muted=muted},[muted]);
 useEffect(()=>()=>assets.forEach(a=>a.url&&URL.revokeObjectURL(a.url)),[]);
 return <div className="app">
  <header><div className="brand"><div className="logo">D</div><div><b>DepthCut</b><small>VIDEO EDITOR</small></div></div><input className="project" value={project} onChange={e=>setProject(e.target.value)}/><div className="actions"><button title="Undo"><Undo2/></button><button title="Redo"><Redo2/></button><button><Save/><span>Save</span></button><button className="export"><Download/><span>Export</span></button></div></header>
  <div className="editor">
   <aside className="sidebar">{tools.map(([n,I])=><button key={n} className={active===n?'active':''} onClick={()=>setActive(n)}><I/><span>{n}</span></button>)}<div className="spacer"/><button><Settings/><span>Settings</span></button></aside>
   <section className="mediaPanel"><div className="panelTitle"><b>{active}</b>{active==='Media'&&<label className="add"><Plus/> Add Media<input ref={input} type="file" multiple accept="video/*,image/*,audio/*" onChange={addFiles}/></label>}</div>
    {active==='Media'&&<div className="assetGrid">{assets.filter(a=>a.kind!=='text').map(a=><div className={'asset '+(selected===a.id?'selected':'')} key={a.id} onClick={()=>choose(a.id)}><div className="thumb">{a.kind==='video'&&<video src={a.url} muted playsInline preload="metadata"/>}{a.kind==='image'&&<img src={a.url} alt="" loading="lazy"/>}{a.kind==='audio'&&<Music/>}{a.kind==='file'&&<Film/>}</div><span title={a.name}>{a.name}</span><button className="assetDelete" onClick={e=>{e.stopPropagation();remove(a.id)}}><Trash2/></button></div>)}{!assets.length&&<div className="empty" onClick={()=>input.current?.click()}><Upload/><b>Import videos, photos & audio</b><small>MP4 · MOV · WebM · JPG · PNG · MP3 · WAV</small></div>}</div>}
    {active==='Text'&&<div className="toolBox"><h3>Text</h3><input value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text"/><button className="primary" onClick={addText}><Plus/> Add to timeline</button></div>}
    {active==='Audio'&&<div className="toolBox"><h3>Audio</h3><p>Import audio from Media, then select it on the timeline.</p></div>}
    {active==='Effects'&&<div className="toolBox"><h3>Effects</h3><button>Brightness</button><button>Contrast</button><button>Blur</button><button>Fade</button></div>}
   </section>
   <main className="previewArea"><div className="previewTop"><span>Preview</span><button><Maximize2/></button></div><div className="previewStage">
    {sel?.kind==='video'&&<video ref={video} className="previewMedia" src={sel.url} playsInline preload="metadata" onLoadedMetadata={onMeta} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/>} 
    {sel?.kind==='image'&&<img className="previewMedia" src={sel.url} alt="Preview"/>}
    {sel?.kind==='text'&&<div className="textPreview">{sel.text}</div>}
    {sel?.kind==='audio'&&<><div className="audioPreview"><Music/><b>{sel.name}</b></div><audio ref={audio} src={sel.url} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/></>}
    {!sel&&<div className="previewEmpty"><Film/><b>Start editing</b><span>Import a video or photo</span></div>}
   </div><div className="transport"><button onClick={()=>{setTime(0);if(video.current)video.current.currentTime=0;if(audio.current)audio.current.currentTime=0}}><SkipBack/></button><button className="play" onClick={toggle}>{playing?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}</button><button onClick={()=>{const t=Math.min(d,time+5);setTime(t);if(video.current)video.current.currentTime=t;if(audio.current)audio.current.currentTime=t}}><SkipForward/></button><span>{fmt(time)} / {fmt(d)}</span><div className="transportSpace"/><button onClick={()=>setMuted(v=>!v)}>{muted?<VolumeX/>:<Volume2/>}</button></div></main>
  </div>
  <footer className="timeline"><div className="timelineHead"><div><b>Timeline</b><span>{fmt(time)} / {fmt(assets.reduce((s,a)=>s+(durations[a.id]||a.duration||5),0))}</span></div><div className="timelineTools"><button title="Split"><Scissors/></button></div></div><div className="timelineBody"><div className="trackLabels"><span>🎬 Video</span><span>🖼 Overlay</span><span>🔊 Audio</span></div><div className="trackScroll"><div className="ruler">{[0,5,10,15,20,25,30].map(x=><span key={x}>{fmt(x)}</span>)}</div><div className="tracks" onClick={seek}>
    {assets.filter(a=>a.kind==='video').map((a,i)=><div key={a.id} className={'clip videoClip '+(selected===a.id?'selectedClip':'')} style={{left:`${i*18}%`,width:'17%'}} onClick={e=>{e.stopPropagation();choose(a.id)}}><video src={a.url} muted preload="metadata"/><span>{a.name}</span></div>)}
    {assets.filter(a=>a.kind==='image'||a.kind==='text').map((a,i)=><div key={a.id} className={'clip overlayClip '+(selected===a.id?'selectedClip':'')} style={{left:`${i*18}%`,width:'17%'}} onClick={e=>{e.stopPropagation();choose(a.id)}}>{a.kind==='image'?<img src={a.url} alt=""/>:a.text}</div>)}
    {assets.filter(a=>a.kind==='audio').map((a,i)=><div key={a.id} className="clip audioClip" style={{left:`${i*18}%`,width:'17%'}} onClick={e=>{e.stopPropagation();choose(a.id)}}><Music/> {a.name}</div>)}
    <div className="timelineCursor" style={{left:`${Math.min(99,Math.max(0,(time/d)*100))}%`}}/>
   </div></div></div></footer>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
