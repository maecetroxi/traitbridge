import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='supabase/functions/traitbridge-v2';
const modules=['types','avatar','matching','orientation','server','endpoint'];
await mkdir(`${base}/shared`,{recursive:true});
for(const name of modules){let source=await readFile(`lib/v2/${name}.ts`,'utf8');source=source.replace(/(from\s+["'])(\.\/[^"']+)(["'])/g,(_,start,p,end)=>`${start}${p.endsWith('.ts')?p:p+'.ts'}${end}`);await writeFile(`${base}/shared/${name}.ts`,source)}
console.log('Packaged shared V2 logic for Supabase Edge; no secrets included.');
