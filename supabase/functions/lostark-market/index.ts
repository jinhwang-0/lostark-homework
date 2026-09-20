const names = ['아드레날린','돌격대장','원한','예리한 둔기','결투의 대가','기습의 대가','타격의 대가','저주받은 인형','질량 증가','슈퍼 차지','각성','전문의'];
const normalize = (s: string) => s.replace(/\s/g, '');
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, OPTIONS','Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const reply = (data: unknown, status=200) => new Response(JSON.stringify(data),{status,headers});
let categoryCode: number | undefined;
Deno.serve(async req => {
  if(req.method==='OPTIONS')return new Response('ok',{headers});
  if(req.method!=='GET')return reply({error:'GET 요청만 가능합니다.'},405);
  const input = new URL(req.url).searchParams.get('engraving') || '';
  const name = names.find(n=>normalize(n)===normalize(input));
  if(!name)return reply({error:'지원하지 않는 각인서입니다.'},400);
  const jwt=Deno.env.get('LOSTARK_JWT');
  if(!jwt)return reply({error:'로스트아크 API 연결 설정을 확인해주세요.'},503);
  try {
    const apiHeaders={accept:'application/json',authorization:`bearer ${jwt}`,'Content-Type':'application/json'};
    const api = async (path: string, init: RequestInit={}) => {
      const res=await fetch('https://developer-lostark.game.onstove.com'+path,{...init,headers:apiHeaders,signal:AbortSignal.timeout(12000)});
      if(!res.ok)throw new Error(res.status===429?'조회 요청이 많습니다. 잠시 후 다시 눌러주세요.':`거래소 조회에 실패했습니다. (${res.status})`);
      return res.json();
    };
    if(categoryCode===undefined){
      const options=await api('/markets/options');
      const category=options.Categories?.find((c: {CodeName:string})=>c.CodeName==='각인서');
      if(!category)throw new Error('거래소 각인서 분류를 찾지 못했습니다.');
      categoryCode=category.Code;
    }
    const data=await api('/markets/items',{method:'POST',body:JSON.stringify({Sort:'CURRENT_MIN_PRICE',CategoryCode:categoryCode,ItemGrade:'유물',ItemName:name,PageNo:1,SortCondition:'ASC'})});
    const matches=(data.Items||[]).filter((item: {Name:string,Grade:string,CurrentMinPrice:number})=>item.Grade==='유물' && [normalize(name)+'각인서','유물'+normalize(name)+'각인서'].includes(normalize(item.Name)) && Number.isSafeInteger(item.CurrentMinPrice) && item.CurrentMinPrice>0);
    if(!matches.length)return reply({error:`유물 ${name} 각인서의 현재 판매 매물이 없습니다.`},404);
    const item=matches.reduce((a: {CurrentMinPrice:number},b: {CurrentMinPrice:number})=>a.CurrentMinPrice<=b.CurrentMinPrice?a:b);
    return reply({name:item.Name,grade:item.Grade,price:item.CurrentMinPrice,queriedAt:new Date().toISOString()});
  } catch(error) {return reply({error:error instanceof Error && error.name==='TimeoutError'?'거래소 응답이 늦습니다. 다시 눌러주세요.':error instanceof Error?error.message:'거래소 조회에 실패했습니다.'},502);}
});
