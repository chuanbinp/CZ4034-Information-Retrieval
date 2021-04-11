# CZ4034 Information Retrieval
<img src="https://user-images.githubusercontent.com/35805397/114295444-e248cc80-9ad7-11eb-817e-c015b3a19467.png" width="50%"/>  

## Quick Start GUI  
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
  
3. Run the GUI Application that is built on Python Tkinter.
```
python guiInterface.py
 ```
Each button will run the respective scripts in a new cmd line.  
<img src="https://user-images.githubusercontent.com/35805397/114295017-0c4cbf80-9ad5-11eb-9508-5c3d16934e1f.png" width="75%" />

<ins>Scrape and Inject</ins>  
a. Run SOLR Database  
b. Scrape Data  
c. Inject Data to SOLR  

<ins>Start application</ins>  
a. Run SOLR Database  
b. Run Server  
c. Run Listener  
d. Run Client  


## Quick Start CMD Line
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
solr start solr start -p 8888
```
Go to your web browser and go to URL *http://localhost:8888/*  
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
  
6. Access ReactJS Frontend  
```
cd react_frontend
npm start
```
Access *http://localhost:3000/* to use client. 

  
## Here are the functions of the 5 main components:  
<img src="https://user-images.githubusercontent.com/35805397/114295002-f5a66880-9ad4-11eb-8386-afe2e1ad78d3.png" width="75%" />

### twitter_scraping.py
Scrape 2000 documents of data from each of our designated 12 sources to come up with a total of 23,326 documents. (OnlyGreenTrades only has 1,326)
`['EliteOptions2', 'WarlusTrades', 'canuck2usa', 'OnlyGreenTrades', 'Ultra_Calls', 'MarketBeatCom', 'stockstobuy', 'TickerReport', 'AmericanBanking','SeekingAlpha', 'MarketRebels', 'TradeOnTheWire1']`

<img src="https://user-images.githubusercontent.com/35805397/114295129-ccd2a300-9ad5-11eb-830e-522a14156040.png" width="75%" />
  
Output file will follow the naming convention:  
`news_<%Y%m%d_%H%M%S>.csv` *where <> represents the datetime when it was scraped*  
  
### inject_data.py
Pre-populate our solr non-SQL database with our ~23k data. It will read in the latest csv file based on its date modified.
<img src="https://user-images.githubusercontent.com/35805397/114295144-e673ea80-9ad5-11eb-9d4f-0c6d6591b5c7.png" width="75%" />


### twitter_stream_to_db.py
Running this script will allow us to listen to the above-mentioned 5 twitter pages so that our **DB is in REALTIME**.  
<img src="https://user-images.githubusercontent.com/35805397/114295201-36eb4800-9ad6-11eb-95de-c31a744f11d7.png" width="75%" />  
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
  
### react_frontend folder
This is the frontend client built on ReactJS and MaterialUI.  
<img src="https://user-images.githubusercontent.com/35805397/114295157-fab7e780-9ad5-11eb-9a95-e35f6ff769cc.png" width="75%" />

Users can:  
1. Enter their search term  
2. Sort using Relevance, Favourite Count or Retweet Count  
3. Sort by Descending or Ascending order  
4. Filter the sources for their search results  
5. View the financial sentiment classification of each tweet on the fly  
6. Be informed and obtain real-time tweets as any of the 12 pages posts them  
7. Get spell-checking suggestions on search terms  


