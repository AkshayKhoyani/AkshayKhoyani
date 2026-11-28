import json,subprocess,re,urllib.parse
exec(open('fix_claims.py').read().split('items=json.load')[0])
W='https://tradenestnaturals.com/wp-json/wp-abilities/v1/abilities/yoast-seo/'
def run(name,inp,get=False):
    if get:
        q='&'.join(f'input[{k}]={v}' for k,v in inp.items())
        r=subprocess.run(['curl','-s','-g',f'{W}{name}/run?{q}'],capture_output=True,text=True).stdout
    else:
        r=subprocess.run(['curl','-s','-X','POST',f'{W}{name}/run','-H','Content-Type: application/json','-d',json.dumps({'input':inp})],capture_output=True,text=True).stdout
    return r
n=0
for t in ['pages','product','posts','product_category']:
  for pg in range(1,8):
    r=subprocess.run(['curl','-s',f'{B}{t}?per_page=100&page={pg}&_fields=id,yoast_head_json.title,yoast_head_json.description'],capture_output=True,text=True).stdout
    try: d=json.loads(r)
    except: break
    if not isinstance(d,list) or not d: break
    for x in d:
      y=x.get('yoast_head_json') or {}
      ti,de=y.get('title') or '',y.get('description') or ''
      if fix(ti)==ti and fix(de)==de: continue
      if t=='product_category':
        g=json.loads(run('get-term-seo-data',{'term_id':x['id']},True))
      else:
        g=json.loads(run('get-post-seo-data',{'post_id':x['id']},True))
      g=g[0] if isinstance(g,list) else g
      g=g.get('posts',[g])[0] if isinstance(g,dict) and 'posts' in g else g
      st=g.get('seo_title') or ''; md=g.get('meta_description') or ''
      inp={}
      if fix(st)!=st: inp['seo_title']=fix(st)
      if fix(md)!=md: inp['meta_description']=fix(md)
      if not inp: print('NOSTORED',t,x['id'],json.dumps(g)[:200]); continue
      if t=='product_category': inp['term_id']=x['id']; res=run('update-term-seo-data',inp)
      else: inp['post_id']=x['id']; res=run('update-post-seo-data',inp)
      n+=1; print(t,x['id'],list(inp),res[:80])
print('updated',n)
