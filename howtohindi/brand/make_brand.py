import sys
from PIL import Image, ImageDraw, ImageFont
out=sys.argv[1]
B='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
OR=(255,122,26,255); NV=(11,26,51,255); WH=(255,255,255,255)
def mark(size):
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,size-1,size-1],radius=size//4,fill=OR)
    f=ImageFont.truetype(B,int(size*0.62))
    d.text((size*0.47,size*0.52),'H',font=f,fill=WH,anchor='mm')
    # small play triangle bottom-right
    s=size*0.2; x=size*0.74; y=size*0.70
    d.polygon([(x,y),(x,y+s),(x+s*0.87,y+s/2)],fill=NV)
    return im
mark(256).save(f'{out}/mark-dark.png')
L=600; im=Image.new('RGBA',(L,L),(0,0,0,0)); d=ImageDraw.Draw(im)
d.ellipse([10,10,L-10,L-10],fill=NV,outline=OR,width=14)
m=mark(190); im.alpha_composite(m,((L-190)//2,95))
f=ImageFont.truetype(B,92)
d.text((L/2,372),'HowTo',font=f,fill=WH,anchor='mm')
d.text((L/2,462),'Hindi',font=f,fill=OR,anchor='mm')
im.save(f'{out}/logo-dark.png')
