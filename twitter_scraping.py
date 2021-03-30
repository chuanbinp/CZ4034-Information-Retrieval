from datetime import datetime
import tweepy
import pandas as pd
import time
import csv
import preprocessor as p

p.set_options(p.OPT.URL, p.OPT.MENTION, p.OPT.RESERVED, p.OPT.EMOJI, p.OPT.SMILEY)

#Helper function to extract more information from twweettext
def processTweetText(tweettext):
    parsed_tweet = p.parse(tweettext)
    tweeturls = None
    tweethashtags = None
    tweetmentions = None
    
    if(parsed_tweet.urls):
        tweeturls = [url.match for url in parsed_tweet.urls]
    
    if(parsed_tweet.hashtags):
        tweethashtags = [ht.match for ht in parsed_tweet.hashtags]
   
    if(parsed_tweet.mentions):
        tweetmentions = [m.match for m in parsed_tweet.mentions]
    
    tweettextcleaned = p.clean(tweettext).replace("#","").replace(":", "")
    
    return [tweeturls,tweethashtags,tweetmentions,tweettextcleaned]

#Main function to perform scraping
def scrapTwitter(username, count, db, noTweets):
    
    tweets = tweepy.Cursor(api.user_timeline,id=username, lang="en", tweet_mode='extended').items(count)
    tweet_list = [tweet for tweet in tweets]

    for tweet in tweet_list:
        #user vars
        username = tweet.user.screen_name
        userdesc = tweet.user.description
        userurl = tweet.user.url
        userpic = tweet.user.profile_image_url_https
        userlocation = tweet.user.location
        userfollowing = tweet.user.friends_count
        userfollowers = tweet.user.followers_count
        usertotaltweets = tweet.user.statuses_count
        usercreatedts = tweet.user.created_at

        #tweet vars
        tweetid = tweet.id_str
        tweetcreatedts = tweet.created_at
        tweetretweetcount = tweet.retweet_count
        tweetfavcount = tweet.favorite_count

        try:
            tweettext = tweet.retweeted_status.full_text
        except AttributeError:  # Not a Retweet
            tweettext = tweet.full_text
        
        [tweeturls,tweethashtags,tweetmentions,tweettextcleaned] = processTweetText(tweettext)
            
        # Add the all variables to the empty list - ith_tweet:
        ith_tweet = [username, userdesc, userurl, userpic, userlocation, userfollowing, userfollowers, usertotaltweets, usercreatedts,
                     tweetid, tweetcreatedts, tweetretweetcount, tweetfavcount, tweeturls, tweethashtags, tweetmentions,
                    tweettext, tweettextcleaned]

        # Append to dataframe - db_tweets
        db.loc[len(db)] = ith_tweet
        # increase counter - noTweets  
        noTweets += 1
    
    print("Successfully scrapped from", username,".\t\tTotal count now: ", noTweets)
    
    return noTweets

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


db_tweets = pd.DataFrame(columns = ['username', 'userdesc', 'userurl', 'userpic','userlocation', 'userfollowing',
                                    'userfollowers', 'usertotaltweets', 'usercreatedts', 'tweetid', 'tweetcreatedts',
                                   'tweetretweetcount', 'tweetfavcount', 'tweeturls', 'tweethashtags', 'tweetmentions',
                                   'tweettext', 'tweettextcleaned'])
usernames = ['CNBC', 'WSJmarkets', 'nytimesbusiness', 'LizAnnSonders', 'FinancialNews']
count = 2000
db = db_tweets
noTweets = 0

for username in usernames:
    try:
        noTweets = scrapTwitter(username, count, db, noTweets)
    except:
        print("Sleep 15min...")
        time.sleep(60*15)
        print("Resume scrapping...")
        noTweets = scrapTwitter(username, count, db, noTweets)

to_csv_timestamp = datetime.today().strftime('%Y%m%d_%H%M%S')
filename_csv =  'news_'+ to_csv_timestamp + '.csv'
db_tweets.to_csv(filename_csv, index = False)

                                   