import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, CircularProgress , Link, CssBaseline, Container, AppBar, Toolbar, TextField, IconButton, Input, Box, Grid, Paper, Avatar, Checkbox, FormControl, InputLabel, Select, MenuItem, ListItemText, Button } from '@material-ui/core';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import SearchIcon from '@material-ui/icons/Search';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import RepeatIcon from '@material-ui/icons/Repeat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import grey from '@material-ui/core/colors/grey';
import PropTypes from 'prop-types';

const io = require('socket.io-client');
const socket = io.connect('http://localhost:5000');

const filter_sources = ['EliteOptions2', 'WarlusTrades', 'canuck2usa', 'OnlyGreenTrades', 'Ultra_Calls', 'MarketBeatCom', 'stockstobuy', 'TickerReport', 'AmericanBanking','SeekingAlpha', 'MarketRebels', 'TradeOnTheWire1'];

const useStyles = makeStyles((theme) => ({
  searchContainer:{
    backgroundColor: theme.palette.secondary.grey, 
    maxWidth: false,
    padding: 10
  },
  resultContainer:{
    backgroundColor: theme.palette.background.paper,
    maxWidth: false,
    padding: 10
  },
  iconButton:{
    padding: 12,
  },
  formControl: {
    margin: 0,
    padding: 0,
    width: "90%"
  },
  paperpref: {
    minWidth: "100%",
    backgroundColor: grey[50],
    padding: "1em"
    },
  avatar: {
    width: "45px",
    height: "45px"
  },
  papertweet:{
    minWidth: "100%",
    padding: "1em",
    margin: 2
  }
}));

function App() {
  const classes = useStyles();

  var searchTerm = React.useRef();
  const [hideSpellingSuggestions, setHideSpellingSuggestions] = React.useState(true);
  const [spellingSuggestions, setSpellingSuggestions] = React.useState([]);
  const [newTweetCount, setNewTweetCount] = React.useState("0");
  const [enabledSortBy, setEnabledSortBy] = React.useState(true);
  const [results, setResults] = React.useState([]);
  const [filterSources, setfilterSources] = React.useState(filter_sources);
  const [filterSortby, setfilterSortby] = React.useState("desc");
  const [filterSortusing, setfilterSortusing] = React.useState("relevance");

  socket.on('connect', function() {
      socket.emit('join', {data: 'Client connected!', cid: socket.id});
  });
  socket.on('results', function(msg) {
      setResults(msg.results);
  });
  socket.on('spelling', function(msg) {
    setHideSpellingSuggestions(msg.hide_spelling_suggestion);
    setSpellingSuggestions(msg.spelling_suggestions);
    // console.log(hideSpellingSuggestions, spellingSuggestions)
  });
  socket.on('new_tweets', function(msg) {
    setNewTweetCount(msg.count)  
  });
  // React.useEffect(() => {
  //   socket.on('connect', function() {
  //       socket.emit('join', {data: 'Client connected!', cid: socket.id});
  //   });
  //   socket.on('results', function(msg) {
  //       setResults(msg.results); 
  //   });
  //   return () => {
  //     // cleanup
  //   }
  // }, [results])

  // React.useEffect(() => {
  //   socket.on('spelling', function(msg) {
  //       setShowSpellingSuggestions(msg.display_spelling_suggestion);
  //       setSpellingSuggestions(msg.spelling_suggestions);
  //       console.log(msg)
  //   });
  //   return () => {
  //     // cleanup
  //   }
  // }, [spellingSuggestions, showSpellingSuggestions])

  // React.useEffect(() => {
  //   socket.on('new_tweets', function(msg) {
  //     setNewTweetCount(msg.count)  
  //   });
  //   return () => {
  //     // cleanup
  //   }
  // }, [newTweetCount])

  const handleFilterSourcesChange = (event) => {
    setfilterSources(event.target.value);
  };

  const handleFilterSortbyChange = (event) => {
    setfilterSortby(event.target.value);
  };

  const handleFilterSortusingChange = (event) => {
    setfilterSortusing(event.target.value);
    if(event.target.value==="relevance"){
      setEnabledSortBy(true);
    } else{
      setEnabledSortBy(false);
    }
  };

  const handleRefreshPage = (event) => {
    socket.emit('refresh_data',  {cid: socket.id});
    //reset page
    setNewTweetCount("0");
    searchTerm.current.value = null;
    setEnabledSortBy(true);
    setfilterSources(filterSources);
    setfilterSortby('desc');
    setfilterSortusing('relevance');
    setHideSpellingSuggestions(true);
    setSpellingSuggestions([]);
    
  };

  const handleSearchClick = (event) => {
    var st = searchTerm.current.value;
    var f_src = filterSources;
    var f_sortby = filterSortby;
    var f_sortusing = filterSortusing;
    if(st==="") return;

    var search_grid = {
        'q':'',
        'fq':'',
    };
    if(st){
        search_grid['q'] += 'tweettextcleaned: '+st
    }
    if(f_src){
        search_grid['fq'] += 'username: ('
        for (var i=0; i<f_src.length; i++) {
            search_grid['fq']+= f_src[i]+','
        }
        if(search_grid['fq'].slice(-1)===","){
          search_grid['fq'] = search_grid['fq'].slice(0,-1);
        }
        search_grid['fq'] += ')'
    }
    search_grid['sort'] = f_sortusing+ ' ' + f_sortby;
    
    console.log(search_grid);
    socket.emit('search', {search_params: search_grid, cid: socket.id});
    console.log("sent");
  };

  const handleSuggestionClick = (event) => {
    var st = event.currentTarget.value;
    var f_src = filterSources;
    var f_sortby = filterSortby;
    var f_sortusing = filterSortusing;
    if(st==="") return;

    var search_grid = {
        'q':'',
        'fq':'',
    };
    if(st){
        search_grid['q'] += 'tweettextcleaned: '+st
    }
    if(f_src){
        search_grid['fq'] += 'username: ('
        for (var i=0; i<f_src.length; i++) {
            search_grid['fq']+= f_src[i]+','
        }
        if(search_grid['fq'].slice(-1)===","){
          search_grid['fq'] = search_grid['fq'].slice(0,-1);
        }
        search_grid['fq'] += ')'
    }
    search_grid['sort'] = f_sortusing+ ' ' + f_sortby;
    
    console.log(search_grid);
    socket.emit('search', {search_params: search_grid, cid: socket.id});
    console.log("sent");

    searchTerm.current.value = st;
    setHideSpellingSuggestions(true);
    setSpellingSuggestions([]);

  }

  function CircularProgressWithLabel(props) {
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="determinate" {...props} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div" color={props.color}>{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }
  
  CircularProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
  };

  function SpellingSuggestion(props) {
    return (
      <Grid container item lg={12} xs={12} justify="center" hidden={props.display} >
        <Typography variant="subtitle2" color="textPrimary" hidden={props.display}>Did you mean: </Typography>
        {
          props.suggestions.map(suggestion => (
            <Button variant="contained" onClick={handleSuggestionClick} value={suggestion} key={suggestion}>{suggestion}</Button>
          ))
        }
      </Grid>
    );
  }

  SpellingSuggestion.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     */
    display: PropTypes.bool.isRequired,
    suggestions: PropTypes.array.isRequired
  };
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <MonetizationOnIcon />
          <ShowChartIcon />
          <Typography variant="h6">
            STF
          </Typography>
        </Toolbar>
      </AppBar>
      <Container align='center' className={classes.searchContainer}>
        <Grid container item lg={8} xs={10} justify="center">

        <Box py={5} width={"100%"}>
          <Grid container item xs={12} justify='center'>  
            <Typography variant="h2" align="center" color="primary"> Stocks Twitter Feed </Typography>
            <Typography variant="subtitle1" align="center" color="primary" gutterBottom> Get live stocks tweets from 12 twitter accounts. Search for your favourite stocks!</Typography>
          </Grid>
        </Box>
          
          <Grid container item xs={10} justify='center'> 

            <Grid container item sm={11} xs={10} justify='center'> 
              <TextField inputRef={searchTerm} variant="outlined" label="Search for" color="secondary" fullWidth/>
            </Grid>

            <Grid container item sm={1} xs={2} justify='center'> 
              <IconButton type="submit" onClick={handleSearchClick} className={classes.iconButton} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Grid>

          </Grid>
          

          <Box py={2} width={"100%"}>
          <Grid container item xs={10} spacing={0}>

            <Grid container item xs={12}>
              <Typography variant="caption" color="primary">Search Preferences</Typography>
            </Grid>
            
            <Paper className={classes.paperpref}>
            <Grid container item xs={12} >
              <Grid container item md={3} xs={12}>
                <FormControl className={classes.formControl}>
                  <InputLabel>Sort using</InputLabel>
                  <Select
                    value={filterSortusing}
                    onChange={handleFilterSortusingChange}
                  >
                    <MenuItem value={"relevance"}>Relevance</MenuItem>
                    <MenuItem value={"tweetfavcount"}>Favourite Count</MenuItem>
                    <MenuItem value={"tweetretweetcount"}>Retweet Count</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid container item md={3} xs={12}>
                <FormControl className={classes.formControl}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={filterSortby}
                    onChange={handleFilterSortbyChange}
                    disabled={enabledSortBy} 
                  >
                    <MenuItem value={"asc"}>Ascending</MenuItem>
                    <MenuItem value={"desc"}>Descending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid container item md={6} xs={12}>
                <FormControl className={classes.formControl}>
                  <InputLabel>Filter Sources</InputLabel>
                  <Select
                    multiple
                    value={filterSources}
                    onChange={handleFilterSourcesChange}
                    input={<Input />}
                    renderValue={(selected) => selected.join(', ')}
                    
                  >
                    {filter_sources.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={filterSources.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            </Paper>
          </Grid>
          </Box>
        </Grid>
          

      </Container>
      <Container align='center' className={classes.resultContainer} >
        <Box py={2}>
        <Grid container item lg={12} xs={12} justify="center">
          <Typography variant="h4" color="primary" align="center">Results</Typography>
          
        </Grid>
        <Grid container item lg={12} xs={12} justify="center" style={{alignItems: "baseline" }}>
          <Button variant="outlined" color="secondary" onClick={handleRefreshPage}>Refresh and Reset page</Button>
          
        </Grid>
        <Grid container item lg={12} xs={12} justify="center" style={{alignItems: "baseline" }}>
          <Typography variant="body1" color="secondary" align="center">{newTweetCount} new tweets.</Typography>
        </Grid>
        </Box>
        <SpellingSuggestion display={hideSpellingSuggestions} suggestions={spellingSuggestions}/>

        <Grid container item lg={6} xs={10}>
        {
          results.map(result => (
            // <Box py={1}>
              <Paper className={classes.papertweet} key={result.id}>
                <Grid container item xs={12}>

                  <Grid container item xs={3} sm={2} md={1}>
                  <Link target="_blank" underline="none" href={"http://www.twitter.com/"+ result.username}>
                    <Avatar alt={result.username[0]} src={result.userpic[0]} className={classes.avatar}/>
                  </Link>
                  </Grid>

                  <Grid container item xs={9} sm={10} md={11}>

                    <Grid container item xs={12} style={{alignItems: "baseline" }}>
                      <Box mr={1}>
                      <Link target="_blank" href={"http://www.twitter.com/"+ result.username}>
                        <Typography variant="h6" color="textPrimary" >{result.username}</Typography>
                      </Link>
                      </Box>
                      <Typography variant="body2" color="textPrimary">{new Date(result.tweetcreatedts).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'})}</Typography>
                    </Grid>

                    <Box my={1}>
                      <Grid container item xs={12} >
                        <Typography variant="body1" color="textPrimary" align="left">{result.tweettext}</Typography>
                      </Grid>
                    </Box>
                    
                    <Grid container item xs={12} style={{alignItems: "center" }}>
                        <Grid container item xs={11} >
                          <StarBorderIcon />
                          <Box mr={2}>
                            <Typography variant="subtitle2" color="textPrimary">{result.tweetfavcount}</Typography>
                          </Box>
                          <RepeatIcon />
                          <Box mr={2}>
                            <Typography variant="subtitle2" color="textPrimary">{result.tweetretweetcount}</Typography>
                          </Box>
                          
                        </Grid>
                        <Grid container item xs={1}>
                            <Box float="right">
                            <Grid container item xs={12}>
                                {result.financial_sentiment==="bull" ?<TrendingUpIcon fontSize="small" color="primary"/>:<TrendingDownIcon fontSize="small" color="secondary"/>}
                                <Typography variant="caption" color={result.financial_sentiment==="bull" ? 'primary' : 'secondary'}>{result.financial_sentiment}</Typography> 
                            </Grid>
                            <Grid container item xs={12}>  
                              <CircularProgressWithLabel value={result.financial_sentiment_score*100} color={result.financial_sentiment==="bull" ? 'primary' : 'secondary'}/>
                            </Grid>
                            </Box>

                        </Grid>
                    </Grid>

                  </Grid>
                  
                </Grid>
              </Paper>
            // </Box>
          ))
        }
        </Grid>

      </Container>
    </>
  );
}

export default App;