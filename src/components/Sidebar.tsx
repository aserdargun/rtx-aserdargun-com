import { ChevronRight } from 'lucide-react';
import { copy, sections } from '../data/content';
import type { Category, Lang } from '../data/content';
export function Sidebar({ lang, active, onChange }: { lang: Lang; active: Category; onChange: (id: Category) => void }) {
  return <aside className="component-rail"><h2>{copy.components[lang]}</h2><nav aria-label={copy.components[lang]}>{sections.map((section, i) => <button key={section.id} aria-current={active === section.id ? 'true' : undefined} className={active === section.id ? 'selected' : ''} onClick={() => onChange(section.id)}><span className="rail-number">{String(i + 1).padStart(2, '0')}</span><span>{section.label[lang]}</span><ChevronRight size={16} /></button>)}</nav><p className="rail-footer">{copy.deep[lang]}</p></aside>;
}
