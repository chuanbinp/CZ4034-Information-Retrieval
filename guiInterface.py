from tkinter import *
import os
import threading

root = Tk()
root.title('Stock Tweets Startup GUI')
root.minsize(300, 400)

def check_status(p):
    if p.is_alive(): # Then the process is still running
        label_1.config(text = "Status: Busy, currently running script...")
        button_1.config(state = "disabled")
        button_2.config(state = "disabled")
        button_3.config(state = "disabled")
        button_4.config(state = "disabled")
        button_5.config(state = "disabled")
        button_6.config(state = "disabled")
        root.after(200, lambda p=p: check_status(p)) # After 200 ms, it will check the status again.
    else:
        label_1.config(text = "Status: Available to run scripts.")
        button_1.config(state = "normal")
        button_2.config(state = "normal")
        button_3.config(state = "normal")
        button_4.config(state = "normal")
        button_5.config(state = "normal")
        button_6.config(state = "normal")
    return

def twitter_scraping():
    os.system('start cmd /k "python twitter_scraping.py"')
    #execfile('server.py') #write any file with .py extension.This method is similar to rightclick and open

def inject_data():
    os.system('start cmd /k "python inject_data.py"')

def run_solr():
    # os.system('start cmd /k "cd ./solr-8.8.1/bin && solr start -p 8888 -s ../example/cloud/node1/solr && start http://localhost:8983/solr/#/"')
    os.system('start cmd /k "cd ./solr-8.8.1/bin && solr start -p 8888 && start http://localhost:8888/solr/#/"')

def run_server():
    os.system('start cmd /k "python server.py')

def run_listener():
    os.system('start cmd /k "python twitter_stream_to_db.py')

def run_client():
    os.system('start cmd /k "cd ./react_frontend && npm start')

def thread_twitter_scraping():
    p = threading.Thread(target=twitter_scraping)
    p.start()
    check_status(p)

def thread_inject_data():
     p =threading.Thread(target=inject_data)
     p.start()
     check_status(p)

def thread_run_solr():
    p =threading.Thread(target=run_solr)
    p.start()
    check_status(p)

def thread_run_server():
    p =threading.Thread(target=run_server)
    p.start()
    check_status(p)

def thread_run_listener():
    p =threading.Thread(target=run_listener)
    p.start()
    check_status(p)

def thread_run_client():
    p =threading.Thread(target=run_client)
    p.start()
    check_status(p)


button_1 = Button(root, text = "Scrape Data", command = thread_twitter_scraping)
button_2 = Button(root, text = "Inject Data to SOLR", command = thread_inject_data)
button_3 = Button(root, text = "Run SOLR Database", command = thread_run_solr)
button_4 = Button(root, text = "Run Server", command = thread_run_server)
button_5 = Button(root, text = "Run Listener", command = thread_run_listener)
button_6 = Button(root, text = "Run Client", command =thread_run_client)
label_1 = Label(master = root, text = "Status: Available to run scripts.")
label_2 = Label(master = root, anchor="e",justify=LEFT, text = 
"""
To startup whole application:
1. Run SOLR Database
(may take some time, ensure browser is open before proceeding)
2. Run Server
3. Run Listener
4. Run Client""")

label_2.pack()
button_1.pack()
button_2.pack()
button_3.pack()
button_4.pack()
button_5.pack()
button_6.pack()
label_1.pack()


root.mainloop()