import tweepy
import pysolr
import csv
import json
import pandas as pd
from numpy import nan
import glob
import os

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

#Find latest csv data file and set as input file name
cwd = os.getcwd()
list_of_files = glob.glob(cwd+'/news*.csv') # * means all if need specific format then *.csv
CSV_FILEPATH = max(list_of_files, key=os.path.getctime)

#Connect to SOLR
solr = pysolr.Solr('http://localhost:8888/solr/new_core/', always_commit=True)
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
