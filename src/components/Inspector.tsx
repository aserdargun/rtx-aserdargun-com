import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { copy, partDetails, sections, sourceById } from '../data/content';
import type { Category, Lang } from '../data/content';
interface Props { lang: Lang; category: Category; selected: string; tour: boolean; onSelect: (id: string) => void; onTour: () => void; onRead: () => void; onTourStep: (delta: number) => void }
export function Inspector({ lang, category, selected, tour, onSelect, onTour, onRead, onTourStep }: Props) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => { panel.current?.scrollTo({ top: 0 }); }, [category]);
  const section = sections.find(s => s.id === category)!; const part = partDetails[selected];
  const parts = Object.entries(partDetails).filter(([,p]) => p.category === category);
  return <aside ref={panel} className="inspector" aria-label={lang === 'tr' ? 'Bileşen ayrıntıları' : 'Component details'}>
    {tour && <div className="tour-head"><span>{lang === 'tr' ? 'Rehberli tur' : 'Guided tour'} · {sections.indexOf(section) + 1}/8</span><button aria-label={copy.close[lang]} onClick={onTour}><X size={16}/></button></div>}
    <h2>{section.title[lang]}</h2><p className="inspector-intro">{section.intro[lang]}</p>
    <dl className="inspector-facts">{section.facts.map(([value, label]) => <div key={label.en}><dt>{value === '6.144' && lang === 'en' ? '6,144' : value}</dt><dd>{label[lang]}</dd></div>)}</dl>
    {category === 'overview' && <>{!tour && <button className="primary-button" onClick={onTour}>{copy.tour[lang]}<ArrowRight size={19}/></button>}<p className="quiet-note">{lang === 'tr' ? '46 bileşeni seç, işlevini öğren, veri yolculuğunu izle.' : 'Select 46 components, discover their roles, follow the data.'}</p></>}
    {parts.length > 0 && <div className="part-picker"><h3>{copy.related[lang]}</h3><div>{parts.map(([id, p]) => <button key={id} className={selected === id ? 'active' : ''} aria-pressed={selected === id} onClick={() => onSelect(id)}>{p.title}</button>)}</div></div>}
    {part && <div className="selected-detail" aria-live="polite"><h3>{part.title}</h3><p>{part.description[lang]}</p></div>}
    {category !== 'overview' && <button className="text-button" onClick={onRead}>{copy.detail[lang]}<ArrowRight size={17}/></button>}
    {tour && <div className="tour-navigation"><button onClick={() => onTourStep(-1)}><ChevronLeft size={16}/>{copy.previous[lang]}</button><button onClick={() => onTourStep(1)}>{copy.next[lang]}<ChevronRight size={16}/></button></div>}
    <div className="inspector-sources">{section.sourceIds.slice(0, 2).map(id => <a key={id} href={sourceById(id).url} target="_blank" rel="noreferrer">{sourceById(id).title}<ArrowUpRight size={13}/></a>)}</div>
  </aside>;
}
