# mysql启动
  #sudo service mysql start
  # 数据库名: bioinfohub (utf8mb4)
  # 用户: bioadmin / bioadmin123

# 后端启动
 cd /mnt/c/Users/13637/Desktop/project/claudecode/bioinfoGet/backend && PYTHONPATH=. /mnt/c/Users/13637/Desktop/project/claudecode/bioinfoGet/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload


# 前端启动
 cd /mnt/c/Users/13637/Desktop/project/claudecode/bioinfoGet/frontend && npx vite --host 127.0.0.1

#浏览器访问
  # 前端: http://127.0.0.1:5173
  # API 文档: http://127.0.0.1:8000/docs

