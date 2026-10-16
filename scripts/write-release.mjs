import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const revision = process.env.GITHUB_SHA || (() => { try { return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); } catch { return 'local-uncommitted'; } })();
const files = readdirSync('dist',{recursive:true,withFileTypes:true}).filter(file=>file.isFile()&&file.name!=='release.json').map(file=>`${file.parentPath}/${file.name}`).sort();
if (!files.some(file=>file.endsWith('.glb')) || files.some(file=>file.includes('/research/'))) throw new Error('Invalid publication artifact');
const assets=Object.fromEntries(files.map(file=>[file.replace(/^dist\//,''),createHash('sha256').update(readFileSync(file)).digest('hex')]));
writeFileSync('dist/release.json',JSON.stringify({application:'rtx',revision,builtAt:new Date().toISOString(),assets},null,2)+'\n');
console.log(`Release ${revision}: ${files.length} public files`);
