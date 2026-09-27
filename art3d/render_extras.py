import asyncio,base64,io,os
from playwright.async_api import async_playwright
from PIL import Image
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','img');os.makedirs(OUT+'/pen',exist_ok=True);os.makedirs(OUT+'/ui',exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--allow-file-access-from-files','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'extras.html'));await pg.wait_for_function('window.__out',timeout=600000)
        out=await pg.evaluate('window.__out')
        for k,v in out.items():
            im=Image.open(io.BytesIO(base64.b64decode(v.split(',')[1]))).convert('RGBA')
            if k.startswith('pen-'): im.convert('RGB').save(f'{OUT}/pen/{k[4:]}.webp','WEBP',quality=82,method=6)
            elif k.startswith('fence-'): im.save(f'{OUT}/pen/{k}.webp','WEBP',quality=85,method=6)
            else: im.save(f'{OUT}/ui/{k[4:]}.webp','WEBP',quality=90,method=6)
        print(len(out),errs[:3]);await b.close()
asyncio.run(main())
