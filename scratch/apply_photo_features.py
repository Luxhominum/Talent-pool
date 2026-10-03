import os
import re

index_path = r"public/index.html"
portal_path = r"public/assessment-portal.html"

with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

with open(portal_path, "r", encoding="utf-8") as f:
    portal_content = f.read()

print(f"Index length: {len(index_content)}, Portal length: {len(portal_content)}")
