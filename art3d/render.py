import asyncio,base64,json,io,os
from playwright.async_api import async_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(HERE,'..','img');os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--allow-file-access-from-files','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+os.path.join(HERE,'render.html'))
        await pg.wait_for_function('window.__out',timeout=120000)
        out=await pg.evaluate('window.__out');meta={}
        for k,v in out.items():
            im=Image.open(io.BytesIO(base64.b64decode(v['url'].split(',')[1]))).convert('RGBA')
            im.save(f'{OUT}/{k}.webp','WEBP',quality=88,method=6)
            meta[k]={kk:vv for kk,vv in v.items() if kk!='url'}
        json.dump(meta,open(os.path.join(HERE,'meta.json'),'w'))
        print(len(out),'render',errs[:3]);await b.close()
asyncio.run(main())
