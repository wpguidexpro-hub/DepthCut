import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Upload,Undo2,Redo2,Save,Download,Trash2,Plus,Play,Pause,SkipBack,SkipForward,Scissors,Type,Music,Film,Layers,Settings,Volume2,VolumeX,Maximize2,GripVertical} from 'lucide-react';
import './styles.css';

const tools=[['Media',Upload],['Text',Type],['Audio',Music],['Effects',Layers]];
const kind=f=>f.type.startsWith('video/')?'video':f.type.startsWith('image/')?'image':f.type.startsWith('audio/')?'audio':'file';
const fmt=s=>{s=Math.max(0,Number(s)||0);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`};
const clipDuration=a=>Math.max(.1,(a.end||a.duration||5)-(a.start||0));

function App(){
 const [active,setActive]=useState('Media'),[assets,setAssets]=useState([]),[selected,setSelected]=useState(null),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[durations,setDurations]=useState({}),[muted,setMuted]=useState(false),[project,setProject]=useState('Untitled Project'),[text,setText]=useState('');
 const input=useRef(),video=useRef(),audio=useRef(),drag=useRef(null);
 const sel=assets.find(a=>a.id===selected)||assets.find(a=>a.kind==='video')||assets[0];
 const d=sel?.kind==='image'||sel?.kind==='text'?5:clipDuration(sel||{duration:5});
 const total=Math.max(1,assets.reduce((m,a)=>Math.max(m,(a.start||0)+clipDuration(a)),0));
 const addFiles=e=>{const files=[...e.target.files||[]];if(!files.length)return;const next=files.map(f=>({id:crypto.randomUUID(),name:f.name,type:f.type,size:f.size,kind:kind(f),url:URL.createObjectURL(f),duration:f.type.startsWith('image/')?5:0,start:0,end:f.type.startsWith('image/')?5:0}));setAssets(a=>[...a,...next]);setSelected(next[0].id);e.target.value=''};
 const remove=id=>{setAssets(a=>{const x=a.find(v=>v.id===id);if(x?.url)URL.revokeObjectURL(x.url);return a.filter(v=>v.id!==id)});if(selected===id){setSelected(null);setPlaying(false)}};
 const choose=id=>{video.current?.pause();audio.current?.pause();setPlaying(false);setTime(0);setSelected(id)};
 const setMediaTime=t=>{const local=Math.max(0,t);setTime(local);const absolute=(sel?.start||0)+local;if(video.current&&sel?.kind==='video')video.current.currentTime=absolute;if(audio.current&&sel?.kind==='audio')audio.current.currentTime=absolute};
 const toggle=()=>{if(!sel)return;if(sel.kind==='video'){if(!video.current)return;playing?video.current.pause():video.current.play().catch(()=>{});return}if(sel.kind==='audio'){if(!audio.current)return;playing?audio.current.pause():audio.current.play().catch(()=>{});return}setPlaying(p=>!p)};
 const seek=e=>{const r=e.currentTarget.getBoundingClientRect();setMediaTime(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*d)};
 const onMeta=e=>{const value=e.currentTarget.duration||5;setDurations(x=>({...x,[sel?.id]:value}));if(sel?.kind==='video'&&(!sel.end||sel.end===0))setAssets(a=>a.map(v=>v.id===sel.id?{...v,duration:value,end:value}:v));if(sel?.kind==='video')e.currentTarget.currentTime=sel?.start||0};
 const addText=()=>{const value=text.trim()||'Your Text';const id=crypto.randomUUID();setAssets(a=>[...a,{id,name:value,type:'text',size:0,kind:'text',url:null,duration:5,start:0,end:5,text:value}]);setSelected(id);setText('')};
 const splitSelected=()=>{if(!sel)return;const len=clipDuration(sel),cut=Math.max(.05,Math.min(len-.05,time));if(cut<=.05||cut>=len-.05)return;const firstEnd=(sel.start||0)+cut;const second={...sel,id:crypto.randomUUID(),name:`${sel.name} (2)`,start:firstEnd,end:sel.end||sel.duration||5};setAssets(a=>a.flatMap(x=>x.id===sel.id?[{...x,end:firstEnd},second]:[x]));setSelected(second.id);setTime(0);setPlaying(false)};
 const moveClip=(id,delta)=>setAssets(a=>a.map(x=>x.id===id?{...x,start:Math.max(0,(x.start||0)+delta),end:Math.max((x.end||x.duration||5)+delta,(x.start||0)+delta+.1)}:x));
 const trimClip=(id,side,delta)=>setAssets(a=>a.map(x=>{if(x.id!==id)return x;const start=x.start||0,end=x.end||x.duration||5;if(side==='left'){const ns=Math.max(0,Math.min(end-.1,start+delta));return {...x,start:ns}}const ne=Math.max(start+.1,Math.min(x.duration||end,end+delta));return {...x,end:ne}}));
 useEffect(()=>{if(video.current)video.current.muted=muted;if(audio.current)audio.current.muted=muted},[muted]);
 useEffect(()=>()=>assets.forEach(a=>a.url&&URL.revokeObjectURL(a.url)),[]);
 useEffect(()=>{const up=e=>{const q=drag.current;if(!q)return;const dx=(e.clientX-q.x)/q.width*q.total;q.x=e.clientX;if(q.mode==='move')moveClip(q.id,dx);else trimClip(q.id,q.mode,dx)};const end=()=>{drag.current=null};window.addEventListener('pointermove',up);window.addEventListener('pointerup',end);return()=>{window.removeEventListener('pointermove',up);window.removeEventListener('pointerup',end)}},[]);
 const beginDrag=(e,id,mode,width,totalTime)=>{e.preventDefault();e.stopPropagation();drag.current={id,mode,x:e.clientX,width,total:totalTime}};
 return <div className="app">
  <header><div className="brand"><div className="logo">D</div><div><b>DepthCut</b><small>VIDEO EDITOR</small></div></div><input className="project" value={project} onChange={e=>setProject(e.target.value)}/><div className="actions"><button title="Undo"><Undo2/></button><button title="Redo"><Redo2/></button><button><Save/><span>Save</span></button><button className="export"><Download/><span>Export</span></button></div></header>
  <div className="editor">
   <aside className="sidebar">{tools.map(([n,I])=><button key={n} className={active===n?'active':''} onClick={()=>setActive(n)}><I/><span>{n}</span></button>)}<div className="spacer"/><button><Settings/><span>Settings</span></button></aside>
   <section className="mediaPanel"><div className="panelTitle"><b>{active}</b>{active==='Media'&&<label className="add"><Plus/> Add Media<input ref={input} type="file" multiple accept="video/*,image/*,audio/*" onChange={addFiles}/></label>}</div>
    {active==='Media'&&<div className="assetGrid">{assets.filter(a=>a.kind!=='text').map(a=><div className={'asset '+(selected===a.id?'selected':'')} key={a.id} onClick={()=>choose(a.id)}><div className="thumb">{a.kind==='video'&&<video src={a.url} muted playsInline preload="metadata"/>}{a.kind==='image'&&<img src={a.url} alt="" loading="lazy"/>}{a.kind==='audio'&&<Music/>}{a.kind==='file'&&<Film/>}</div><span title={a.name}>{a.name}</span><button className="assetDelete" onClick={e=>{e.stopPropagation();remove(a.id)}}><Trash2/></button></div>)}{!assets.length&&<div className="empty" onClick={()=>input.current?.click()}><Upload/><b>Import videos, photos & audio</b><small>MP4 · MOV · WebM · JPG · PNG · MP3 · WAV</small></div>}</div>}
    {active==='Text'&&<div className="toolBox"><h3>Text</h3><input value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text"/><button className="primary" onClick={addText}><Plus/> Add to timeline</button></div>}
    {active==='Audio'&&<div className="toolBox"><h3>Audio</h3><p>Import audio from Media, then drag its clip on the timeline.</p></div>}
    {active==='Effects'&&<div className="toolBox"><h3>Effects</h3><button>Brightness</button><button>Contrast</button><button>Blur</button><button>Fade</button></div>}
   </section>
   <main className="previewArea"><div className="previewTop"><span>Preview</span><button><Maximize2/></button></div><div className="previewStage">
    {sel?.kind==='video'&&<video ref={video} className="previewMedia" src={sel.url} playsInline preload="metadata" onLoadedMetadata={onMeta} onTimeUpdate={e=>{const local=Math.max(0,e.currentTarget.currentTime-(sel.start||0));setTime(Math.min(d,local));if(sel.end&&e.currentTarget.currentTime>=sel.end){e.currentTarget.pause();e.currentTarget.currentTime=sel.start||0;setPlaying(false)}}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>} 
    {sel?.kind==='image'&&<img className="previewMedia" src={sel.url} alt="Preview"/>}
    {sel?.kind==='text'&&<div className="textPreview">{sel.text}</div>}
    {sel?.kind==='audio'&&<><div className="audioPreview"><Music/><b>{sel.name}</b></div><audio ref={audio} src={sel.url} onLoadedMetadata={onMeta} onTimeUpdate={e=>{const local=Math.max(0,e.currentTarget.currentTime-(sel.start||0));setTime(Math.min(d,local));if(sel.end&&e.currentTarget.currentTime>=sel.end){e.currentTarget.pause();setPlaying(false)}}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/></>}
    {!sel&&<div className="previewEmpty"><Film/><b>Start editing</b><span>Import a video or photo</span></div>}
   </div><div className="transport"><button onClick={()=>setMediaTime(0)}><SkipBack/></button><button className="play" onClick={toggle}>{playing?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}</button><button onClick={()=>setMediaTime(Math.min(d,time+5))}><SkipForward/></button><span>{fmt(time)} / {fmt(d)}</span><div className="transportSpace"/><button onClick={()=>setMuted(v=>!v)}>{muted?<VolumeX/>:<Volume2/>}</button></div></main>
  </div>
  <footer className="timeline"><div className="timelineHead"><div><b>Timeline</b><span>{fmt(time)} / {fmt(total)}</span></div><div className="timelineTools"><button title="Split selected clip" onClick={splitSelected}><Scissors/></button></div></div><div className="timelineBody"><div className="trackLabels"><span>🎬 Video</span><span>🖼 Overlay</span><span>🔊 Audio</span></div><div className="trackScroll"><div className="ruler">{[0,5,10,15,20,25,30].map(x=><span key={x}>{fmt(x)}</span>)}</div><div className="tracks" onClick={seek}>
    {assets.filter(a=>a.kind==='video').map(a=><TimelineClip key={a.id} a={a} selected={selected===a.id} onSelect={choose} beginDrag={beginDrag} total={total} remove={remove}/>) }
    {assets.filter(a=>a.kind==='image'||a.kind==='text').map(a=><TimelineClip key={a.id} a={a} selected={selected===a.id} onSelect={choose} beginDrag={beginDrag} total={total} remove={remove} overlay/>)}
    {assets.filter(a=>a.kind==='audio').map(a=><TimelineClip key={a.id} a={a} selected={selected===a.id} onSelect={choose} beginDrag={beginDrag} total={total} remove={remove} audio/>)}
    <div className="timelineCursor" style={{left:`${Math.min(99.5,Math.max(0,(time/total)*100))}%`}}/>
   </div></div></div></footer>
 </div>
}

function TimelineClip({a,selected,onSelect,beginDrag,total,remove,overlay,audio}){const width=Math.max(3,(clipDuration(a)/total)*100);const left=((a.start||0)/total)*100;const row=audio?'audioClip':overlay?'overlayClip':'videoClip';return <div className={'clip '+row+(selected?' selectedClip':'')} style={{left:`${left}%`,width:`${width}%`}} onPointerDown={e=>beginDrag(e,a.id,'move',e.currentTarget.parentElement.clientWidth,total)} onClick={e=>{e.stopPropagation();onSelect(a.id)}}><button className="trimHandle left" onPointerDown={e=>beginDrag(e,a.id,'left',e.currentTarget.parentElement.parentElement.clientWidth,total)}/><GripVertical className="dragIcon"/>{a.kind==='video'&&<video src={a.url} muted preload="metadata"/>}{a.kind==='image'&&<img src={a.url} alt=""/>}{audio&&<Music/>}<span>{a.name}</span><button className="clipDelete" onClick={e=>{e.stopPropagation();remove(a.id)}}><Trash2/></button><button className="trimHandle right" onPointerDown={e=>beginDrag(e,a.id,'right',e.currentTarget.parentElement.parentElement.clientWidth,total)}/></div>}

createRoot(document.getElementById('root')).render(<App/>);
