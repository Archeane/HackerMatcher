import json
from pprint import pprint

with open('C:/users/zheng/downloads/us_institutions.json') as f:
    data = json.load(f)

json_doc = []
for row in data:
    institution = row['institution']
    json_doc.append({
        "id": institution,
        "text": institution
    })

with open('us_institutions.json', 'w') as outfile:
    json.dump(json_doc, outfile)
