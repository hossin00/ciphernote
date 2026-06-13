import { useState } from 'react';
import { BookOpen, Lock, Eye, EyeOff, Plus, Trash2, Search, Smile } from 'lucide-react';
import { format } from 'date-fns';
interface Entry { id:string; title:string; content:string; mood:string; date:string; createdAt:number; }
const MOODS=['😊','😐','😢','😡','🥳','😴','🤔','❤️'];
const SAVE='cn_entries_v1';
const loadE=():Entry[]=>{try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]}};
export default function App() {
  const [locked,setLocked]=useState(true);
  const [input,setInput]=useState(''); const [confirm,setConfirm]=useState('');
  const [showPw,setShowPw]=useState(false); const [isNew,setIsNew]=useState(!localStorage.getItem('cn_hash'));
  const [error,setError]=useState(''); const [entries,setEntries]=useState<Entry[]>([]);
  const [view,setView]=useState<'list'|'edit'>('list');
  const [current,setCurrent]=useState<Entry|null>(null);
  const [search,setSearch]=useState('');
  const unlock=async(e:React.FormEvent)=>{e.preventDefault();setError('');
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input+'cn_salt'));
    const h=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(isNew){if(input.length<4){setError('Min 4 chars');return;}if(input!==confirm){setError("Mismatch");return;}
      localStorage.setItem('cn_hash',h);setEntries(loadE());setIsNew(false);setLocked(false);
    }else{if(h!==localStorage.getItem('cn_hash')){setError('Wrong password');setInput('');return;}setEntries(loadE());setLocked(false);}};
  const save=(items:Entry[])=>{setEntries(items);localStorage.setItem(SAVE,JSON.stringify(items));};
  const filtered=entries.filter(e=>!search||e.title.toLowerCase().includes(search.toLowerCase())||e.content.toLowerCase().includes(search.toLowerCase()));
  const ac='#a855f7';
  const inp={width:'100%',background:'#080810',border:`1px solid #1e0a3c`,borderRadius:'10px',padding:'11px 14px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter',transition:'border-color 0.2s'};
  if(locked)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'radial-gradient(ellipse at 50% 0%, #1a0828 0%, #080810 60%)'}}>
      <div style={{width:'100%',maxWidth:'360px',textAlign:'center'}}>
        <div style={{width:'76px',height:'76px',borderRadius:'22px',background:`linear-gradient(135deg,${ac},#7e22ce)`,boxShadow:`0 16px 48px ${ac}45`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}><BookOpen size={32} color="white"/></div>
        <h1 style={{fontFamily:'Inter',fontSize:'26px',fontWeight:'700',color:'white',marginBottom:'5px'}}>CipherNote</h1>
        <p style={{color:'#4a1d96',fontSize:'13px',marginBottom:'28px'}}>{isNew?'Create PIN to lock your diary':'Enter PIN to read your diary'}</p>
        <form onSubmit={unlock} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{position:'relative'}}>
            <input type={showPw?'text':'password'} value={input} onChange={e=>setInput(e.target.value)} placeholder="PIN / Password" autoFocus
              style={{...inp,paddingRight:'44px'}} onFocus={e=>e.target.style.borderColor=ac} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
            <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:'11px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#4a1d96'}}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>
          </div>
          {isNew&&<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm" style={inp} onFocus={e=>e.target.style.borderColor=ac} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>}
          {error&&<p style={{color:'#ef4444',fontSize:'12px'}}>{error}</p>}
          <button type="submit" style={{background:ac,color:'white',border:'none',borderRadius:'11px',padding:'13px',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:`0 6px 20px ${ac}40`}}>{isNew?'Lock Diary':'Unlock Diary'}</button>
        </form>
      </div>
    </div>
  );
  if(view==='edit')return(
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'13px 20px',borderBottom:'1px solid #1e0a3c',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('list')} style={{color:'#d8b4fe',background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Back</button>
        <span style={{color:'white',fontSize:'13px',fontWeight:'600'}}>{current?.date||format(new Date(),'MMMM d, yyyy')}</span>
        <button onClick={()=>{if(!current)return;const u=entries.find(e=>e.id===current.id)?entries.map(e=>e.id===current.id?current:e):[current,...entries];save(u);setView('list');}}
          style={{padding:'6px 13px',borderRadius:'8px',background:ac,border:'none',color:'white',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Save</button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'20px'}}>
        <input value={current?.title||''} onChange={e=>setCurrent(c=>c?{...c,title:e.target.value}:c)} placeholder="Entry title..."
          style={{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid #1e0a3c',outline:'none',fontSize:'20px',fontWeight:'700',color:'white',paddingBottom:'12px',marginBottom:'16px',fontFamily:'Inter',caretColor:ac}}
          onFocus={e=>e.target.style.borderColor=ac} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {MOODS.map(m=><button key={m} onClick={()=>setCurrent(c=>c?{...c,mood:m}:c)} style={{fontSize:'22px',padding:'5px',borderRadius:'8px',border:`1px solid ${current?.mood===m?ac:'#1e0a3c'}`,background:current?.mood===m?ac+'20':'transparent',cursor:'pointer',transition:'all 0.15s'}}>{m}</button>)}
        </div>
        <textarea value={current?.content||''} onChange={e=>setCurrent(c=>c?{...c,content:e.target.value}:c)}
          placeholder="Write freely. This is your private space..." rows={14}
          style={{width:'100%',background:'transparent',border:'none',outline:'none',resize:'none',fontSize:'15px',lineHeight:'1.8',color:'#d8b4fe',fontFamily:'Inter',caretColor:ac}}/>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'14px 20px',borderBottom:'1px solid #1e0a3c',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
          <div style={{width:'34px',height:'34px',borderRadius:'9px',background:`linear-gradient(135deg,${ac},#7e22ce)`,display:'flex',alignItems:'center',justifyContent:'center'}}><BookOpen size={15} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'15px',color:'white',lineHeight:1}}>CipherNote</div><div style={{fontSize:'10px',color:'#4a1d96',marginTop:'2px'}}>{entries.length} entries</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          <button onClick={()=>setLocked(true)} style={{padding:'6px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#4a1d96'}}><Lock size={14}/></button>
          <button onClick={()=>{const e={id:crypto.randomUUID(),title:'',content:'',mood:'😊',date:format(new Date(),'MMMM d, yyyy'),createdAt:Date.now()};setCurrent(e);setView('edit');}} style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'8px',background:ac,border:'none',color:'white',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>
            <Plus size={13}/> New
          </button>
        </div>
      </header>
      <div style={{padding:'10px 20px',borderBottom:'1px solid #1e0a3c'}}>
        <div style={{position:'relative'}}>
          <Search size={13} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'#4a1d96'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries..." style={{width:'100%',background:'#0e0820',border:'1px solid #1e0a3c',borderRadius:'9px',padding:'8px 12px 8px 30px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter'}}
            onFocus={e=>e.target.style.borderColor=ac} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'12px 20px',display:'flex',flexDirection:'column',gap:'7px'}}>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'48px',marginBottom:'14px'}}>📓</div>
            <h3 style={{fontSize:'18px',fontWeight:'700',color:'white',marginBottom:'8px'}}>{entries.length===0?'Start your diary':'No matches'}</h3>
            <p style={{color:'#4a1d96',fontSize:'13px',lineHeight:'1.6',maxWidth:'220px',margin:'0 auto 18px'}}>{entries.length===0?'Your thoughts are safe here. Encrypted. Private.':'Try a different search.'}</p>
            {entries.length===0&&<button onClick={()=>{const e={id:crypto.randomUUID(),title:'',content:'',mood:'😊',date:format(new Date(),'MMMM d, yyyy'),createdAt:Date.now()};setCurrent(e);setView('edit');}} style={{padding:'10px 22px',borderRadius:'9px',background:ac,border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Write first entry</button>}
          </div>
        ):[...filtered].sort((a,b)=>b.createdAt-a.createdAt).map(entry=>(
          <div key={entry.id} style={{background:'#0e0820',border:'1px solid #1e0a3c',borderRadius:'11px',padding:'13px',cursor:'pointer',transition:'all 0.2s'}}
            onClick={()=>{setCurrent(entry);setView('edit');}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ac+'40'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e0a3c'}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'3px'}}>
                  <span style={{fontSize:'18px'}}>{entry.mood}</span>
                  <span style={{color:'white',fontSize:'13px',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.title||'Untitled entry'}</span>
                </div>
                <div style={{color:'#4a1d96',fontSize:'11px',marginBottom:'5px'}}>{entry.date}</div>
                <div style={{color:'#6b21a8',fontSize:'12px',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{entry.content}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();save(entries.filter(x=>x.id!==entry.id));}} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',color:'#4a1d96',flexShrink:0}}><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
