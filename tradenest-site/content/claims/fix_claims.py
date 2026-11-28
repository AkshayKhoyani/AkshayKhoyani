import json,subprocess,re,sys
B='https://tradenestnaturals.com/wp-json/wp/v2/'
def fix(s):
    s=re.sub(r'FSSAI licen[cs]ed manufacturer','FSSAI registered supplier',s,flags=re.I)
    s=re.sub(r'FSSAI([- ])Licen[cs]ed',r'FSSAI\1Registered',s)
    s=re.sub(r'FSSAI([- ])licen[cs]ed',r'FSSAI\1registered',s,flags=re.I)
    s=re.sub(r'FSSAI licen[cs]e (number|no\.?)',r'FSSAI registration \1',s,flags=re.I)
    s=re.sub(r'FSSAI licen[cs]e\b','FSSAI registration',s)
    s=s.replace('is a manufacturer and exporter','is a supplier and exporter')
    s=s.replace('registered manufacturer','registered supplier')
    s=re.sub(r'([Ss])easoning [Mm]anufacturer(?!s)',lambda m:m.group(1)+'easoning '+('Supplier' if m.group(0)[-12]=='M' else 'supplier'),s)
    s=s.replace('seasoning supplier and supplier','seasoning blender and supplier').replace('seasoning supplier exporter','seasoning supplier and exporter')
    return s
items=json.load(open(sys.argv[1]))
bk={}
for t,i in items:
    if t=='product_category':
        d=json.loads(subprocess.run(['curl','-s',f'{B}{t}/{i}?context=edit&_fields=description'],capture_output=True,text=True).stdout)
        bk[f'{t}:{i}']=d; new={'description':fix(d['description'])}
        if new['description']==d['description']: continue
    else:
        d=json.loads(subprocess.run(['curl','-s',f'{B}{t}/{i}?context=edit&_fields=content.raw,title.raw,excerpt.raw'],capture_output=True,text=True).stdout)
        bk[f'{t}:{i}']=d; new={}
        for f in ['content','title','excerpt']:
            v=d[f]['raw']; w=fix(v)
            if w!=v: new[f]=w
        if not new: continue
    code=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','POST',f'{B}{t}/{i}','-H','Content-Type: application/json','-d',json.dumps(new)],capture_output=True,text=True).stdout
    print(t,i,list(new),code)
json.dump(bk,open('backup_'+sys.argv[1].split('/')[-1],'w'),ensure_ascii=False)
