import os
# import time
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import pysolr
import json as js

template_dir = os.getcwd()
template_dir = os.path.join(template_dir, 'templates')
app = Flask(__name__)
socketio = SocketIO(app)

solr = pysolr.Solr('http://localhost:8983/solr/tweets/', always_commit=True, results_cls=dict)
solr.ping()

# new_tweet = False
# new_tweet_count = 0
new_tweet_count_dict = {}


def getAllDataDesc():
    results = solr.search('*', sort='tweetcreatedts desc', rows=10)
    print("Successfully retrieved ", len(results['response']['docs']), "rows of data.")
    return results

def getData(params):
    if(len(params['q'])==0):
        params['q'] = "*"
    if('relevance' in params['sort']):
        results = solr.search(params['q'], rows=10)
    else:
        results = solr.search(params['q'], sort=params['sort'], rows=10)
    print("Successfully retrieved ", len(results['response']['docs']), "rows of data.")
    return results   


@app.route("/")
def index():
    #return
    print(template_dir)
    return render_template('index.html')

# @socketio.on('client_connect')
# def client_connect(json):
#     print('Client connected, cid: ' + str(json['cid']))
#     new_tweet_count_dict[json['cid']] = 0

@socketio.on('join')
def on_join(json):
    room = json['cid']
    join_room(room)
    new_tweet_count_dict[json['cid']] = 0
    print('Client connected, cid: ' + str(json['cid']))
    print(new_tweet_count_dict)
    results = getAllDataDesc()
    # print(results['response']['docs'])
    # results = js.dumps(getAllDataDesc())
    socketio.emit('results', {'results': results['response']['docs']}, room = json['cid']) #emit to specific users


@socketio.on('leave')
def on_leave(json):
    room = json['cid']
    leave_room(room)
    new_tweet_count_dict.pop([json['cid']])
    print('Client disconnected, cid: ' + str(json['cid']))
    print(new_tweet_count_dict)

@socketio.on('search')
def get_tweets(json):
    print('received json: ' + str(json))
    results = getData(json['search_params'])
    #apply sentiment
    socketio.emit('results', {'results': results['response']['docs']}, room = json['cid']) #emit to specific users

@socketio.on('refresh_data')
def refresh_data(json):
    # for key, val in new_tweet_count_dict.items():
    #     if(key == json['cid']):
    new_tweet_count_dict[json['cid']] = 0
    results = getAllDataDesc()
    socketio.emit('results', {'results': results['response']['docs']}, room = json['cid']) #emit to specific users

@socketio.on('streamer_new_tweet')
def streamer_new_tweet(json):
    global new_tweet_count_dict
    for key, val in new_tweet_count_dict.items():
        new_tweet_count_dict[key] = val+1 #update dict
        socketio.emit('new_tweets', {'count':val+1}, room = key) #emit to specific users
    print("Updated all counts")
    print(new_tweet_count_dict)

if __name__ == "__main__":
    socketio.run(app)