import tweepy
import pysolr
import csv
import json
import pandas as pd
from numpy import nan

#Helper function to convert stringlist to list 
def stringToList(string):
    # input format : "['str1', 'str2', ''str3]" , note the spaces after the commas, in this case I have a list of integers
    try:
        string = string[1:len(string)-1]
        if len(string) != 0: 
            tempList = string.split(", ")
            #print(tempList)
            newList = list(map(lambda x: str(x.replace("'","")), tempList))
        else:
            newList = []
    except:
        newList = nan
    return(newList)

#Functions to interact with SOLR
def addData(d):
    solr.add(d)
    print("Successfully added ", len(d),"new data to SOLR.")
    
def deleteAllData():
    solr.delete(q='*:*')
    print("Successfully deleted all data from SOLR.")
    
def removeNOldestData(N):
    results = solr.search('*', sort='tweetcreatedts asc', rows=N)
    results = [[result['id'], result['username'], result['tweetcreatedts']] for result in results]
    print("Deleting the following: ")
    for result in results:
        print(" ", result)
    deletingIds = [result[0] for result in results]
    solr.delete(id=deletingIds)
    print("Successfully deleted ", N,"oldest data from SOLR.")
    
def getAllDataDesc():
    results = solr.search('*', sort='tweetcreatedts Desc', rows=10000)
    print("Successfully retrieved ", len(results), "rows of data from SOLR.")
    return results    

#Define input file name
CSV_FILEPATH = 'news_20210331_232029.csv'

#Connect to SOLR
solr = pysolr.Solr('http://localhost:8983/solr/tweets/', always_commit=True)
solr.ping()

#Read in data to dictionary
data = pd.read_csv(CSV_FILEPATH)
data["tweeturls"] = data["tweeturls"].apply(lambda x: stringToList(x))
data["tweethashtags"] = data["tweethashtags"].apply(lambda x: stringToList(x))
data["tweetmentions"] = data["tweetmentions"].apply(lambda x: stringToList(x))
data_dict = data.to_dict(orient='records')
print("Successfully loaded", len(data), "rows of data.")

#Perform data reset and injection
deleteAllData()
addData(data_dict)
