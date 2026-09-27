import asyncio,base64,io,os,sys
from playwright.async_api import async_playwright
from PIL import Image
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','img','cast');os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--allow-file-access-from-files','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'tokens.html'));await pg.wait_for_function('window.__out',timeout=180000)
        out=await pg.evaluate('window.__out')
        for k,v in out.items():
            im=Image.open(io.BytesIO(base64.b64decode(v.split(',')[1]))).convert('RGBA');im.save(f'{OUT}/{k}.webp','WEBP',quality=90,method=6)
        print(len(out),errs[:3]);await b.close()
asyncio.run(main())
