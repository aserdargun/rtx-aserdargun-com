import { useEffect, useRef, useState } from 'react';
import { Focus, Layers2, Minus, Plus, Rotate3D, Tag, Download } from 'lucide-react';
import { AtlasScene } from '../scene/AtlasScene';
import type { CameraView, SceneState } from '../scene/AtlasScene';
import { copy, flows } from '../data/content';
import type { Lang, FlowId } from '../data/content';
interface Props { lang: Lang; state: SceneState; view: CameraView; viewKey: number; flowId: FlowId; onSelect: (id: string) => void; onToggle: (key: 'rotate' | 'isolate' | 'labels') => void; onStep: (step: number) => void }
export function ModelViewer({ lang, state, view, viewKey, flowId, onSelect, onToggle, onStep }: Props) {
  const host = useRef<HTMLDivElement>(null); const engine = useRef<AtlasScene | null>(null);
  const select = useRef(onSelect); select.current = onSelect;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [downloadError, setDownloadError] = useState(false);
  useEffect(() => {
    let alive = true; setStatus('loading');
    try {
      engine.current = new AtlasScene(host.current!, id => select.current(id), () => { if (alive) setStatus('error'); });
      engine.current.load().then(() => { if (alive) setStatus('ready'); }).catch(() => { if (alive) setStatus('error'); });
    } catch { setStatus('error'); }
    return () => { alive = false; engine.current?.dispose(); engine.current = null; };
  }, [attempt]);
  useEffect(() => { engine.current?.update(state); }, [state, status]);
  useEffect(() => { engine.current?.view(view); }, [view, viewKey, status]);
  useEffect(() => { engine.current?.renderer.domElement.setAttribute('aria-label', lang === 'tr' ? 'Etkileşimli temsili RTX Spark N1X modeli' : 'Interactive representative RTX Spark N1X model'); }, [lang, status]);
  const flow = flows.find(f => f.id === flowId)!;
  const save = async () => {
    if (!engine.current) return;
    setDownloadError(false);
    try {
      const blob = await engine.current.snapshot(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'rtx-spark-atlas.png';
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { setDownloadError(true); }
  };
  return <section className="model-stage" aria-label={lang === 'tr' ? 'Üç boyutlu mimari' : 'Three-dimensional architecture'} data-testid="model-stage" data-status={status}>
    <div className="scene-host" ref={host} />
    <div className="stage-top"><span className="stage-index">N1X / 128 GB</span><span className="stage-instruction">{copy.hint[lang]}</span></div>
    {downloadError && <p className="download-error" role="alert">{lang === 'tr' ? 'Görüntü oluşturulamadı. Yeniden dene.' : 'Image export failed. Please try again.'}</p>}
    {status !== 'ready' && <div className="model-status" role="status">{status === 'loading' ? <><span className="spinner" />{copy.loading[lang]}</> : <><img src="/models/architecture-poster.png" alt={lang === 'tr' ? 'Blender ile oluşturulan temsili mimari' : 'Representative architecture rendered in Blender'} /><p>{copy.error[lang]}</p><button onClick={() => setAttempt(a => a + 1)}>{copy.retry[lang]}</button></>}</div>}
    <div className="viewport-tools" aria-label={lang === 'tr' ? 'Görünüm araçları' : 'View tools'}>
      <button title={lang === 'tr' ? 'Seçime yakınlaş' : 'Focus selection'} aria-label={lang === 'tr' ? 'Seçime yakınlaş' : 'Focus selection'} disabled={status !== 'ready' || state.selected === 'overview'} onClick={() => engine.current?.focus(state.selected)}><Focus /></button>
      <button title={copy.rotate[lang]} aria-label={copy.rotate[lang]} aria-pressed={state.rotate} onClick={() => onToggle('rotate')}><Rotate3D /></button>
      <button title={copy.labels[lang]} aria-label={copy.labels[lang]} aria-pressed={state.labels} onClick={() => onToggle('labels')}><Tag /></button>
      <button title={lang === 'tr' ? 'Yalnız seçili bölümü göster' : 'Isolate section'} aria-label={lang === 'tr' ? 'Yalnız seçili bölümü göster' : 'Isolate section'} aria-pressed={state.isolate} onClick={() => onToggle('isolate')}><Layers2 /></button>
      <span className="tool-divider" />
      <button aria-label={lang === 'tr' ? 'Yakınlaştır' : 'Zoom in'} title={lang === 'tr' ? 'Yakınlaştır' : 'Zoom in'} onClick={() => engine.current?.zoom(1.2)}><Plus /></button>
      <button aria-label={lang === 'tr' ? 'Uzaklaştır' : 'Zoom out'} title={lang === 'tr' ? 'Uzaklaştır' : 'Zoom out'} onClick={() => engine.current?.zoom(1 / 1.2)}><Minus /></button>
      <button aria-label={lang === 'tr' ? '3B görünümü indir' : 'Download 3D view'} title={lang === 'tr' ? '3B görünümü indir' : 'Download 3D view'} disabled={status !== 'ready'} onClick={save}><Download /></button>
    </div>
    {state.flowVisible && <div className="flow-caption" aria-live="polite"><div className="flow-steps">{flow.steps.map((step, i) => <button key={step.title.en} className={state.step === i ? 'active' : ''} aria-label={step.title[lang]} aria-current={state.step === i ? 'step' : undefined} onClick={() => onStep(i)}>{i + 1}</button>)}</div><div><strong>{flow.steps[state.step].title[lang]}</strong><p>{flow.steps[state.step].text[lang]}</p></div></div>}
    <p className="stage-caption"><span className="caption-dot" />{copy.caption[lang]}</p>
  </section>;
}
