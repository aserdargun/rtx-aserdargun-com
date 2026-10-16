import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Cpu } from 'lucide-react';
import { copy, flows, partDetails, sections } from './data/content';
import type { Category, FlowId, Lang } from './data/content';
import type { CameraView, SceneState } from './scene/AtlasScene';
import { Sidebar } from './components/Sidebar';
import { ModelViewer } from './components/ModelViewer';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { Architecture } from './components/Architecture';
import { Sources } from './components/Sources';
type Tab = 'explore' | 'architecture' | 'sources';
const sectionPart: Record<Category,string> = {overview:'overview',cpu:'cpu0',gpu:'gpu',link:'c2c_s',memory:'memory',cache:'slc',io:'display',power:'overview'};
function initialLang(): Lang { const query = new URLSearchParams(window.location.search).get('lang'); if (query === 'en' || query === 'tr') return query; try { return localStorage.getItem('rtx-atlas-lang') === 'en' ? 'en' : 'tr'; } catch { return 'tr'; } }
export default function App() {
 const [lang,setLang]=useState<Lang>(initialLang); const [tab,setTab]=useState<Tab>('explore');
 const [category,setCategory]=useState<Category>('overview'); const [selected,setSelected]=useState('overview');
 const [view,setView]=useState<CameraView>('assembled'); const [viewKey,setViewKey]=useState(0); const [separation,setSeparation]=useState(0);
 const [playing,setPlaying]=useState(false); const [flowVisible,setFlowVisible]=useState(false); const [flowId,setFlowId]=useState<FlowId>('data'); const [step,setStep]=useState(0); const [speed,setSpeed]=useState(1);
 const [rotate,setRotate]=useState(false); const [isolate,setIsolate]=useState(false); const [labels,setLabels]=useState(true); const [tour,setTour]=useState(false);
 const selectCategory=useCallback((id:Category)=>{setCategory(id);setSelected(sectionPart[id]);},[]);
 const selectPart=useCallback((id:string)=>{const part=partDetails[id];if(part){setSelected(id);setCategory(part.category);}},[]);
 const flow=flows.find(f=>f.id===flowId)!;
 useEffect(()=>{document.documentElement.lang=lang;try{localStorage.setItem('rtx-atlas-lang',lang);}catch{/* storage is optional */}},[lang]);
 useEffect(()=>{window.scrollTo({top:0});},[tab]);
 useEffect(()=>{if(tab==='architecture')window.scrollTo({top:0});},[category,tab]);
 useEffect(()=>{if(!playing||tab!=='explore')return;const timer=window.setInterval(()=>setStep(s=>(s+1)%flow.steps.length),3600/speed);return()=>clearInterval(timer);},[playing,speed,flow,tab]);
 useEffect(()=>{if(flowVisible)selectPart(flow.steps[step].part);},[step,flowVisible,flow,selectPart]);
 useEffect(()=>{if(!tour||tab!=='explore')return;const timer=window.setTimeout(()=>{const i=sections.findIndex(s=>s.id===category);if(i===sections.length-1)setTour(false);else selectCategory(sections[i+1].id);},8500);return()=>clearTimeout(timer);},[tour,category,tab,selectCategory]);
 const sceneState=useMemo<SceneState>(()=>({selected,category:category==='power'?'overview':category,separation,playing,flowVisible,speed,rotate,isolate,labels,path:flow.steps.map(s=>s.part),step}),[selected,category,separation,playing,flowVisible,speed,rotate,isolate,labels,flow,step]);
 const changeView=(v:CameraView)=>{setView(v);setViewKey(k=>k+1);setSeparation(v==='exploded'?1:0);};
 const reset=()=>{setFlowVisible(false);setPlaying(false);setTour(false);setRotate(false);setIsolate(false);setLabels(true);setStep(0);setSpeed(1);setFlowId('data');selectCategory('overview');changeView('assembled');};
 const tourStep=(delta:number)=>{const i=sections.findIndex(s=>s.id===category);selectCategory(sections[(i+delta+sections.length)%sections.length].id);};
 const animateStep=(delta:number)=>{setFlowVisible(true);setPlaying(false);setTour(false);setIsolate(false);setStep(s=>(s+delta+flow.steps.length)%flow.steps.length);};
 const openTab=(next:Tab)=>{setTab(next);setPlaying(false);setFlowVisible(false);setTour(false);};
 return <><a className="skip-link" href="#main">{lang==='tr'?'İçeriğe geç':'Skip to content'}</a><header className="site-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();openTab('explore');reset();}} aria-label="RTX Spark Atlas"><Cpu size={30}/><span>RTX <i>/</i> SPARK ATLAS</span></a><nav aria-label={lang==='tr'?'Ana gezinme':'Main navigation'}>{(['explore','architecture','sources'] as const).map(id=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>openTab(id)}>{copy[id][lang]}</button>)}</nav><div className="header-right"><a href="https://aserdargun.com" target="_blank" rel="noreferrer">aserdargun.com<ArrowUpRight size={15}/></a><div className="language-switch" aria-label={lang==='tr'?'Dil':'Language'}><button lang="tr" aria-label="Türkçe" aria-pressed={lang==='tr'} onClick={()=>setLang('tr')}>TR</button><span>/</span><button lang="en" aria-label="English" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button></div></div></header><main id="main"><div className="title-band"><h1>{copy.title[lang]}</h1><p><strong>N1X</strong><span> · 128 GB · 20 CPU / {lang==='tr'?'6.144':'6,144'} CUDA</span></p></div>
 {tab==='explore'?<><div className="workspace"><Sidebar lang={lang} active={category} onChange={id=>{setTour(false);setPlaying(false);setFlowVisible(false);selectCategory(id);}}/><ModelViewer lang={lang} state={sceneState} view={view} viewKey={viewKey} flowId={flowId} onSelect={id=>{setPlaying(false);setFlowVisible(false);setTour(false);selectPart(id);}} onToggle={key=>{if(key==='rotate')setRotate(v=>!v);if(key==='labels')setLabels(v=>!v);if(key==='isolate')setIsolate(v=>!v);}} onStep={index=>{setStep(index);setPlaying(false);}}/><Toolbar lang={lang} view={view} onView={changeView} separation={separation} onSeparation={v=>{setSeparation(v);setView(v>0?'exploded':'assembled');}} playing={playing} onPlay={()=>{setFlowVisible(true);setPlaying(v=>!v);setTour(false);setIsolate(false);}} flowId={flowId} onFlow={id=>{setFlowId(id);setStep(0);}} speed={speed} onSpeed={setSpeed} onReset={reset} onStep={animateStep}/><Inspector lang={lang} category={category} selected={selected} tour={tour} onSelect={id=>{setPlaying(false);setFlowVisible(false);selectPart(id);}} onTour={()=>{setPlaying(false);setFlowVisible(false);setTour(t=>!t);if(!tour)selectCategory('overview');}} onRead={()=>openTab('architecture')} onTourStep={tourStep}/></div><div className="spec-strip"><div><strong>300 <small>GB/{lang==='tr'?'sn':'s'}</small></strong><span>{copy.bandwidth[lang]}</span></div><div><strong>600 <small>GB/{lang==='tr'?'sn':'s'}</small></strong><span>{lang==='tr'?'NVLink-C2C · duyurulan':'NVLink-C2C · announced'}</span></div><div><strong>256 <small>bit</small></strong><span>{copy.bus[lang]}</span></div><div><strong>1 <small>PFLOP</small></strong><span>{copy.peak[lang]}</span></div></div></>:tab==='architecture'?<Architecture lang={lang} category={category} onCategory={selectCategory} onExplore={id=>{selectPart(id);setTab('explore');}}/>:<Sources lang={lang}/>}
 </main><footer><span>{lang==='tr'?'16 Ekim 2026 · NVIDIA kaynakları':'October 16, 2026 · NVIDIA sources'}</span><span>{lang==='tr'?'Temsili eğitim modeli':'Representative educational model'}<i>·</i>Blender + Three.js</span></footer></>;
}
