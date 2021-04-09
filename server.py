import os
# import time
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import pysolr
import json as js
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk import word_tokenize, sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from urllib.parse import urlencode
import requests
import pandas as pd


template_dir = os.getcwd()
template_dir = os.path.join(template_dir, 'templates')
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

solr = pysolr.Solr('http://localhost:8888/solr/new_core/', always_commit=True, results_cls=dict)
solr.ping()

MODEL_FILENAME = "pickle_model.pkl"

new_tweet_count_dict = {}
loaded_model = pickle.load(open(MODEL_FILENAME, 'rb'))

#fitting
url = "./classification/train.csv"
col_names = ["tweettextcleaned","sentiment"]
df = pd.read_csv(url,  names = col_names, header = 1)
df = df[df['sentiment']!=1]
df['tweettextcleaned'] = df['tweettextcleaned'].astype(str)
df['tweettextcleaned'] = df['tweettextcleaned'].str.lower()
df['tweettextcleaned'] = df['tweettextcleaned'].str.split()
stop_words = set(stopwords.words('english')) 
df['tweettextcleaned'] = df['tweettextcleaned'].apply(lambda x: " ".join(x for x in x if x not in stop_words))
df['tweettextcleaned'] = df['tweettextcleaned'].apply(lambda x: word_tokenize(x))
stemmer = PorterStemmer()
df['tweettextcleaned'] = df['tweettextcleaned'].apply(lambda x: [stemmer.stem(y) for y in x])
df['tweettextcleaned'] = df['tweettextcleaned'].apply(lambda x: " ".join(x for x in x))
tf=TfidfVectorizer()
text_tf= tf.fit_transform(df['tweettextcleaned'])

def modelPreprocessing(input):
    #preprocessing
    output = str(input)
    output = output.lower()
    output = output.split()
    stop_words = set(stopwords.words('english')) 
    output = " ".join(x for x in output if x not in stop_words)
    output = word_tokenize(output)
    stemmer = PorterStemmer()
    output = [stemmer.stem(y) for y in output]
    output = [str(" ".join(x for x in output))[3:-3]]
    # print(output)
    text_tf= tf.transform(output)

    return text_tf

def onTheFlyPredictor(results):
    for doc in results['response']['docs']:
        output = modelPreprocessing(doc["tweettextcleaned"])
        doc["financial_sentiment_score"] = float(loaded_model.predict_proba(output)[0][1])
        doc["financial_sentiment"] = "bear" if (int(loaded_model.predict(output)[0]) == 0) else "bull"
        # print(doc["financial_sentiment_score"])
        # print(doc["financial_sentiment"])
        # print()
    return results

def getAllDataDesc():
    results = solr.search('*', sort='tweetcreatedts desc', rows=15)
    print("Successfully retrieved ", len(results['response']['docs']), "rows of data.")
    results = onTheFlyPredictor(results)
    results['response']['hide_spelling_suggestion'] = True
    results['response']['spelling_suggestions'] = []
    # print(results)
    return results

def getData(params):
    spell_chk_params = params.copy()

    if(len(params['q'])==0):
        params['q'] = "*"
    if(len(params['fq'])==12):
        params['fq'] = "username:none"
        spell_chk_params.pop("fq")
    if('relevance' in params['sort']):
        results = solr.search(params['q'], fq=params['fq'], rows=15)
        spell_chk_params.pop("sort")
    else:
        results = solr.search(params['q'], fq=params['fq'], sort=params['sort'], rows=15)
    results = onTheFlyPredictor(results)

    spell_chk_params['wt'] = "json"

    response = requests.get('http://localhost:8888/solr/new_core/spell?'+urlencode(spell_chk_params))
    
    results['response']['hide_spelling_suggestion'] = True
    results['response']['spelling_suggestions'] = []
    if response.status_code == 200:
        json_response = response.json()
        if(json_response['spellcheck']['correctlySpelled'] == False):
            results['response']['hide_spelling_suggestion'] = False
            suggestions = []
            for obj in json_response['spellcheck']['suggestions']:
                if(type(obj) != str):
                    suggestions.extend(obj['suggestion'])

            sorted_suggestions = sorted(suggestions, key=lambda x: x['freq'], reverse=True)[:5]
            results['response']['spelling_suggestions'] = [x['word'] for x in sorted_suggestions]

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
    print(new_tweet_count_dict)
    results = getData(json['search_params'])
    #apply sentiment
    socketio.emit('results', {'results': results['response']['docs']}, room = json['cid']) #emit to specific users
    # print(results['response']['hide_spelling_suggestion'], results['response']['spelling_suggestions'])
    socketio.emit('spelling', {'spelling_suggestions': results['response']['spelling_suggestions'], 'hide_spelling_suggestion':results['response']['hide_spelling_suggestion']}, room = json['cid'])

@socketio.on('refresh_data')
def refresh_data(json):
    # for key, val in new_tweet_count_dict.items():
    #     if(key == json['cid']):
    new_tweet_count_dict[json['cid']] = 0
    results = getAllDataDesc()
    socketio.emit('results', {'results': results['response']['docs']}, room = json['cid']) #emit to specific users
    # print(results['response']['hide_spelling_suggestion'], results['response']['spelling_suggestions'])
    socketio.emit('spelling', {'spelling_suggestions': results['response']['spelling_suggestions'], 'hide_spelling_suggestion':results['response']['hide_spelling_suggestion']}, room = json['cid'])

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