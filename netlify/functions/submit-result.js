const {db,respond}=require('./_shared');
const M=[[8,20,3],[6,9,20],[8,20,4],[8,4,20]],E=[[4,10,1],[3,4,10]];
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Метод не поддерживается'});
 if((event.body||'').length>3000)return respond(413,{error:'Слишком большой запрос'});
 try{
  const d=JSON.parse(event.body||'{}');
  const name=String(d.name||'').trim().replace(/\s+/g,' ');
  if(name.length<2||name.length>36||/[<>\x00-\x1f]/.test(name))return respond(400,{error:'Введите имя от 2 до 36 символов'});
  if(!Array.isArray(d.answers)||d.answers.length!==4||!Array.isArray(d.events)||d.events.length!==2)return respond(400,{error:'Неполные ответы'});
  const valid=(v)=>Number.isInteger(v)&&v>=-1&&v<=2;
  if(!d.answers.every(valid)||!d.events.every(valid))return respond(400,{error:'Некорректные ответы'});
  const wave=Number(d.wave);
  if(!Number.isInteger(wave)||wave<1||wave>20)return respond(400,{error:'Некорректная группа'});
  const a=d.answers,e=d.events;
  const penalty=(a[0]!==2?5:0)+(a[2]!==1?5:0);
  const score=Math.max(0,a.reduce((s,c,i)=>s+(c<0?0:M[i][c]),0)+e.reduce((s,c,i)=>s+(c<0?0:E[i][c]),0)-penalty);
  let stock=75,floor=77,team=76;
  if(a[0]===1){team+=12;floor+=7}else{team-=14;floor-=8}
  if(a[1]===2){floor+=17;team+=4}else{floor-=15}
  if(a[2]===1){stock+=20;team+=5}else{stock-=22;team-=8}
  if(a[3]===2){stock+=8;floor+=6}else{stock-=9}
  if(e[0]===1){team+=8}else{team-=15;floor-=5}
  if(e[1]===2){stock+=8;team+=5}else{stock-=18;team-=7}
  const clamp=v=>Math.max(10,Math.min(100,v));
  await db('game_results',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({director_name:name,wave_number:wave,score,warehouse_score:clamp(stock),salesfloor_score:clamp(floor),team_score:clamp(team)})});
  return respond(200,{ok:true,score});
 }catch(err){return respond(500,{error:'Не удалось сохранить результат. Проверьте настройки и повторите.'})}
};
