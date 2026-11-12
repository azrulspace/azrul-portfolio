"""Derive instance variants/sizing from the read-only Framer snapshot."""
import json
from pathlib import Path
pages=json.loads(Path('reference/framer-pages.json').read_text())
components={'cZf75lXzE':'hero-section','qNFhySoru':'dribbble-shot-section','RXGrRXy0g':'why-me-section','vRHIJ6yDl':'featured-works-section','cSUoR88Cl':'section-difference','pyt24a02k':'section-blogs','JvyI0C4qT':'faq-section','o_z14XAzy':'testimonials','ZvxbMzNqN':'design-lagi-section','rQBbHNKxX':'footer-desktop','HVzOtNFzm':'header-section','FJLRkCvvE':'hero-section-works','CmasvaekB':'featured-works-section-2','UfSw2Fgab':'hero-section-about','f672huHX1':'about-me-section','gv1FW1O78':'what-i-do-section','r9nwhI9FE':'integration-tools-section','nYFTged1O':'contact-section','KgF7aNYyh':'hero-section-vibe','TUizGW9ln':'hero-section-project-nurri','XJd69HtVj':'content-details-nurri','uZBg8z5JN':'hero-hastyhire','l48wfGPjt':'content-details-hastyhire','vs5hh_slg':'hero-agenticas','UPSKlBbG6':'content-details-hastyhire-2','LaGob9DeV':'hero-eduqat-course','wP_zHj5gc':'content-details-eduqat-course','l7Q5rXqpO':'hero-eduqat-assignment','d683r1nrx':'content-details-eduqat-assignment','JeYrowbEm':'content-header','c2ejTlKcZ':'content-panel'}
orders={
'/':['GP5sGAH6j','DCCTsD0Kp','nmSPdIAkU','VgQLlSmR5','xaiTMCpda','N15W6Mx2K','blzamraI1','jl73qRUf5','RkBjb2ejE','IsVNELrJ2'],
'/works':['a9Cse4xy4','SFSXecZBR','VGgECzY7Q','xwki_Z7HO','wNh2Ykssg'],
'/aboutme':['NYCvT4UEA','Tbu6tfucJ','a7Zfvwf24','mMBmu5Ta1','xmDGVktgv','e3oe2jO1g'],
'/vibe':['sXf_s56qY'],
'/project/nurri':['NSbm3qTL8','f3yyK53JD','whEYglGRj'],
'/project/hastyhire':['lNH5_cBsO','LbAaJHywV','m2TvAA2zu'],
'/project/agenticas':['b4nOhPjwo','Bb6tRaVhY','pZBZiVFOg'],
'/project/eduqat-ai-course':['corz8i2AS','h9yDVg3_T','Tm5WZPLml'],
'/project/eduqat-assignment':['fxkz6nS7S','xdSnGMpHh','gBePxgbtV']}
def walk(n):
 yield n
 for c in n.get('children',[]):yield from walk(c)
def spec(n):
 return {'id':n.get('elementId') or components[n['component']], 'component':components[n['component']], 'sourceId':n.get('$originalId',n['id']), 'height':n.get('height','auto'), 'props':{k[10:]:v for k,v in n.items() if k.startswith('$control__') and not isinstance(v,dict)}}
result={}
for p in pages:
 variants={}
 for b in p['children']:
  if b.get('name') not in ['Desktop','Tablet','Phone']:continue
  nodes=list(walk(b));lookup={n.get('$originalId',n['id']):n for n in nodes}
  sections=[]
  previous=None
  for id in orders[p['path']]:
   n=lookup[id];s=spec(n)
   if p['path']=='/' and previous:
    s['gap']=round(n['$rect']['y']-previous['$rect']['y']-previous['$rect']['height'])
   elif p['path']=='/works' and id in ['xwki_Z7HO','wNh2Ykssg']:s['gap']=80
   elif p['path']=='/works' and id=='VGgECzY7Q':s['gap']=80 if b['name']=='Desktop' else 0
   elif p['path'].startswith('/project/') and id==orders[p['path']][1]:
    s['gap']=max(0,round(n['$rect']['y']-previous['$rect']['height']))
   sections.append(s);previous=n
  header=next(n for n in nodes if n.get('component') in ['HVzOtNFzm','JeYrowbEm'])
  overlays=[n for n in nodes if n.get('name')=='Content Navigation' and n.get('visible',True) and n.get('children')]
  panel=spec(overlays[0]['children'][0]) if overlays else None
  if panel:panel.update(width=overlays[0]['width'],top=overlays[0]['top'],right=overlays[0].get('right','20px'))
  variants[b['name']]={'sections':sections,'header':spec(header),'headerTop':header.get('top','0px'),'panel':panel}
 result[p['path']]={'background':p['children'][0].get('fill','#fafafa'),'breakpoints':variants}
Path('src/framer-layout.json').write_text(json.dumps(result,indent=2)+'\n')
