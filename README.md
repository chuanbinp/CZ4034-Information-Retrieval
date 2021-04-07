# CZ4034 Information Retrieval

## Quick Start  
1. Install dependencies  
```
pip install -r requirements.txt
npm install
```
  
2. Obtain your twitter api keys from *https://developer.twitter.com/en* and fill in the key.csv file.  
```
access_key,  <your access key>
access_secret,  <your access secret>
consumer_key,  <your consumer key>
consumer_secret,  <your consumer secret>
```  
  
3. Run SOLR on your local machine  
```
cd \solr-8.8.1\bin  
solr start -c -p 8983 -s ../example/cloud/node1/solr
```
Go to your web browser and go to URL *http://localhost:8983/*  
Take note you need to have SOLR running before running scripts `inject_data.py` and `twitter_stream_to_db.py`
  
To stop,
```
cd \solr-8.8.1\bin  
solr stop -all
```
  
4. Start server to serve data from solr
```
python server.py
```
  
5. Start listening for new tweets!  
```
python twitter_stream_to_db.py
```
Since the solr has already been pre-populated, we can just run the `twitter_stream_to_db.py` script.  
This allows us to listen for new tweets from the 12 chosen accounts and update our db instantly so that our **DB is in REALTIME**.  
  
6. Access *http://localhost:5000/* to see server in action :)  
Refer to static/main.js to get reference code on how to call server 
  
7. Access ReactJS Frontend  
```
cd react_frontend
npm start
```
Access *http://localhost:3000/* to see client. 

  
## Here are the functions of the 4 main files:
### twitter_scraping.py
Scrape 2000 documents of data from each of our designated 12 sources to come up with a total of 23,326 documents. (OnlyGreenTrades only has 1,326)
`['EliteOptions2', 'WarlusTrades', 'canuck2usa', 'OnlyGreenTrades', 'Ultra_Calls', 'MarketBeatCom', 'stockstobuy', 'TickerReport', 'AmericanBanking','SeekingAlpha', 'MarketRebels', 'TradeOnTheWire1']`
  
Output file will follow the naming convention:  
`news_<%Y%m%d_%H%M%S>.csv` *where <> represents the datetime when it was scraped*  
  
### inject_data.py
Pre-populate our solr non-SQL database with our 10k data. Change the variable `CSV_FILEPATH in line 48` to the new file name.  
  
### twitter_stream_to_db.py
Running this script will allow us to listen to the above-mentioned 5 twitter pages so that our **DB is in REALTIME**.  
And so when there is a new tweet, it will:  
a. Add that tweet to our db, then  
b. Delete the oldest tweet based on tweetcreatedts  
  
Therefore, we will always maintain a dynamic database of size 23,326 documents.
  
### server.py
We are using a flask server as our backend. Socketio is used to transmit messages between server, client and twitterstreamer.  
To see functionalities of our server, you can access *http://localhost:5000/* which is a skeleton frontend that serves up information as queried.  
  
Also, whenever there is a new tweet, the twitterstreamer will inform our backend server which will update the server's new_tweet_count_dict dictionary.
```
new_tweet_count_dict = {
  <client_session_id_1> : count1,
  <client_session_id_2> : count2,
  ....
}

*where count1 reflects the number of new tweets client1 has not seen yet 
```
  
This allows us to **update each specific frontend client** to show:  
a. If there are new tweets?  
b. If a is True, how many are there?  
c. If a is True, the *refresh button* will also be activated  
