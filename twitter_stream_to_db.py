import tweepy
import csv
import preprocessor as p
import pysolr
from numpy import nan
import socketio

p.set_options(p.OPT.URL, p.OPT.MENTION, p.OPT.RESERVED, p.OPT.EMOJI, p.OPT.SMILEY)

#Helper function to extract more information from twweettext
def processTweetText(tweettext):
    parsed_tweet = p.parse(tweettext)
    tweeturls = nan
    tweethashtags = nan
    tweetmentions = nan
    
    if(parsed_tweet.urls):
        tweeturls = [url.match for url in parsed_tweet.urls]
    
    if(parsed_tweet.hashtags):
        tweethashtags = [ht.match for ht in parsed_tweet.hashtags]
   
    if(parsed_tweet.mentions):
        tweetmentions = [m.match for m in parsed_tweet.mentions]
    
    tweettextcleaned = p.clean(tweettext).replace("#","").replace(":", "")
    
    return [tweeturls,tweethashtags,tweetmentions,tweettextcleaned]

#Helper function to check if tweet is from user only
def from_creator(status):
    if hasattr(status, 'retweeted_status'):
        return False
    elif status.in_reply_to_status_id != None:
        return False
    elif status.in_reply_to_screen_name != None:
        return False
    elif status.in_reply_to_user_id != None:
        return False
    else:
        return True

class StreamListener(tweepy.StreamListener):
    def on_status(self, status):
        if from_creator(status):
            #user vars
            username = status.user.screen_name
            userdesc = status.user.description
            userurl = status.user.url
            userpic = status.user.profile_image_url_https
            userlocation = status.user.location
            userfollowing = status.user.friends_count
            userfollowers = status.user.followers_count
            usertotaltweets = status.user.statuses_count
            usercreatedts = str(status.user.created_at)

            #tweet vars
            tweetid = status.id_str
            tweetcreatedts = str(status.created_at)
            tweetretweetcount = status.retweet_count
            tweetfavcount = status.favorite_count

            if hasattr(status, 'retweeted_status') and hasattr(status.retweeted_status, 'extended_tweet'):
                tweettext = status.retweeted_status.extended_tweet['full_text']
            if hasattr(status, 'extended_tweet'):
                tweettext = status.extended_tweet['full_text']
            else:
                tweettext = status.text

            [tweeturls,tweethashtags,tweetmentions,tweettextcleaned] = processTweetText(tweettext)

            ith_tweet = [username, userdesc, userurl, userpic, userlocation, userfollowing, userfollowers, usertotaltweets, usercreatedts,
                         tweetid, tweetcreatedts, tweetretweetcount, tweetfavcount, tweeturls, tweethashtags, tweetmentions,
                        tweettext, tweettextcleaned]

            obj = dict(zip(key_list, ith_tweet))

            #Send to solr
            addData(obj)
            #Remove small data
            removeNOldestData(1)
            sio.emit('streamer_new_tweet', {'data': 'new tweet received'})
        
    def on_error(self, status_code):
        if status_code == 420:
            return False


#Functions to interact with SOLR
def addData(d):
    print("Adding the following: ")
    print(" username: ", d['username'])
    print(" tweetcreatedts: ", d['tweetcreatedts'])
    print(" tweettextcleaned: ", d['tweettextcleaned'])
    solr.add(d)
    print("Successfully added 1 new data.")
    
def deleteAllData():
    solr.delete(q='*:*')
    print("Successfully deleted all data.")
    
def removeNOldestData(N):
    results = solr.search('*', sort='tweetcreatedts asc', rows=N)
    results = [[result['id'], result['username'], result['tweetcreatedts']] for result in results]
    print("Deleting the following: ")
    for result in results:
        print(" ", result)
    deletingIds = [result[0] for result in results]
    solr.delete(id=deletingIds)
    print("Successfully deleted ", N,"oldest data.")
    print()
    
def getAllDataDesc():
    results = solr.search('*', sort='tweetcreatedts Desc', rows=10000)
    print("Successfully retrieved ", len(results), "rows of data.")
    return results

#List of keys
key_list = ['username', 'userdesc', 'userurl', 'userpic', 'userlocation',
       'userfollowing', 'userfollowers', 'usertotaltweets', 'usercreatedts',
       'tweetid', 'tweetcreatedts', 'tweetretweetcount', 'tweetfavcount',
       'tweeturls', 'tweethashtags', 'tweetmentions', 'tweettext',
       'tweettextcleaned']

# Twitter Authorization
# Read in external file for keys
with open('keys.csv', mode='r') as infile:
    reader = csv.reader(infile)
    KEYS = {rows[0]:rows[1] for rows in reader}
# Twitter credentials
consumer_key = KEYS['consumer_key']
consumer_secret = KEYS['consumer_secret']
access_key = KEYS['access_key']
access_secret = KEYS['access_secret']
# Pass your twitter credentials to tweepy via its OAuthHandler
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
api = tweepy.API(auth)

l = StreamListener()
stream = tweepy.Stream(auth, l, tweet_mode='extended')

#Connect to SOLR
solr = pysolr.Solr('http://localhost:8888/solr/new_core/', always_commit=True)
solr.ping()

#Connect to backend
sio = socketio.Client()
sio.connect('http://localhost:5000')

#Start listening
stream.filter(follow=['372322178','1018324467758465024', '748611168168644612', '430841130', '779131850023378944', '89517375', '68559732', '37564410', '1979190776', '61661638', '23059499', '817007725666242561', '51912109'])

