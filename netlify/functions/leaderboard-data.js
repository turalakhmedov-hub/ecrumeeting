const {db,respond}=require('./_shared');
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Метод не поддерживается'});
 try{
  const body=JSON.parse(event.body||'{}');
  const pin=process.env.LEADERBOARD_PIN;
  if(!pin||pin.length<8)return respond(503,{error:'PIN ведущего ещё не настроен'});
  if(typeof body.pin!=='string'||body.pin!==pin)return respond(403,{error:'Неверный код ведущего'});
  const wave=Number(body.wave||1);
  if(!Number.isInteger(wave)||wave<1||wave>20)return respond(400,{error:'Некорректная группа'});
  const rows=await db('game_results?select=director_name,score,warehouse_score,salesfloor_score,team_score,created_at&wave_number=eq.'+wave+'&order=score.desc,created_at.asc&limit=200');
  return respond(200,{rows});
 }catch(e){return respond(500,{error:'Не удалось получить результаты'})}
};
