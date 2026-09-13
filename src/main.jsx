import React,{useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Box,Film,Image as ImageIcon,Music,Type,Layers,Settings,Play,Pause,Plus,Upload,Undo2,Redo2,Save,Download,Grid3X3,Trash2,MousePointer2} from 'lucide-react';
import './styles.css';

const tools=[['Media',Upload],['3D Objects',Box],['Text',Type],['Audio',Music],['Effects',Layers]];
const kind=f=>f.type.startsWith('video')?'video':f.type.startsWith('image')?'image':f.type.startsWith('audio')?'audio':/\.(glb|gltf|obj)$/i.test(f.name)?'model':'file';
function App(){
 const [active,setActive]=useState('Media'),[playing,setPlaying]=useState(false),[assets,setAssets]=useState([]),[selected,setSelected]=useState(null),[project,setProject]=useState('Untitled Project');
 const input=useRef();
 const addFiles=e=>setAssets(a=>[...a,...Array.from(e.target.files||[]).map((f,i)=>({id:crypto.randomUUID(),name:f.name,type:f.type,size:f.size,kind:kind(f),url:URL.createObjectURL(f)}))]);
 const addToTimeline=a=>{if(!a)return; setSelected(a.id)};
 const remove=id=>setAssets(a=>a.filter(x=>x.id!==id));
 return <div className="app">
 <header><div className="brand"><div className="logo">D</div><div><b>DepthCut</b><small>3D VIDEO EDITOR</small></div></div><input className="project" value={project} onChange={e=>setProject(e.target.value)}/><div className="actions"><button title="Undo"><Undo2/></button><button title="Redo"><Redo2/></button><button><Save/> Save</button><button className="export"><Download/> Export</button></div></header>
 <div className="workspace">
 <aside className="sidebar">{tools.map(([n,I])=><button className={active===n?'active':''} onClick={()=>setActive(n)} key={n}><I/><span>{n}</span></button>)}<div className="spacer"/><button><Settings/><span>Settings</span></button></aside>
 <section className="assets"><div className="panelTitle"><b>{active}</b><label className="add"><Plus/> Add Media<input ref={input} type="file" multiple accept="video/*,image/*,audio/*,.glb,.gltf,.obj" onChange={addFiles}/></label></div><div className="assetGrid">{assets.map(a=><div className={'asset '+(selected===a.id?'selected':'')} key={a.id} onDoubleClick={()=>addToTimeline(a)}><div className="thumb">{a.kind==='video'&&<video src={a.url} muted/>}{a.kind==='image'&&<img src={a.url} alt=""/>}{a.kind==='audio'&&<Music/>}{a.kind==='model'&&<Box/>}{a.kind==='file'&&<Film/>}</div><span title={a.name}>{a.name}</span><button className="assetDelete" onClick={e=>{e.stopPropagation();remove(a.id)}}><Trash2/></button></div>)}{!assets.length&&<div className="empty" onClick={()=>input.current?.click()}><Upload/><b>Import your media</b><small>Video · Images · Audio · 3D Models</small></div>}</div></section>
 <main className="viewport"><div className="viewportTop"><span>Perspective</span><span><Grid3X3/> Scene View</span></div><div className="scene"><div className="grid"></div><div className="cube">D</div><div className="hint"><MousePointer2/> 3D VIEWPORT · Drag media here</div></div><div className="transport"><button onClick={()=>setPlaying(!playing)}>{playing?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}</button><span>00:00:00:00</span><div className="scrub"/></div></main>
 <aside className="inspector"><div className="panelTitle"><b>Inspector</b></div>{selected?<div className="properties"><b>Selected asset</b><p>{assets.find(a=>a.id===selected)?.name}</p><label>Position X<input type="number" defaultValue="0"/></label><label>Position Y<input type="number" defaultValue="0"/></label><label>Position Z<input type="number" defaultValue="0"/></label><label>Scale<input type="number" defaultValue="1" step="0.1"/></label></div>:<div className="inspectorEmpty"><Layers/><b>No object selected</b><small>Select media or a 3D object to edit Transform, Material, Animation and more.</small></div>}</aside>
 </div>
 <footer className="timeline"><div className="timelineHead"><b>Timeline</b><span>00:00 / 00:00</span><div><button>+</button><button>−</button></div></div><div className="tracks"><div className="trackLabels"><span>🎥 Video 1</span><span>🧊 3D Scene</span><span>🔊 Audio 1</span></div><div className="ruler"><span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span></div><div className="trackArea">{assets.slice(0,4).map((a,i)=><div className="clip" key={a.id} style={{left:(i*18)+'%',width:'16%'}} onClick={()=>setSelected(a.id)}>{a.name}</div>)}<div className="playhead"/></div></div></footer>
 </div>}
createRoot(document.getElementById('root')).render(<App/>);
