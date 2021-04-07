import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Link, CssBaseline, Container, AppBar, Toolbar, TextField, IconButton, Input, Box, Grid, Paper, Avatar, Checkbox, FormControl, InputLabel, Select, MenuItem, ListItemText, Button } from '@material-ui/core';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import SearchIcon from '@material-ui/icons/Search';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import RepeatIcon from '@material-ui/icons/Repeat';
import grey from '@material-ui/core/colors/grey';

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
  const [newTweetCount, setNewTweetCount] = React.useState("0");
  const [enabledSortBy, setEnabledSortBy] = React.useState(true);
  const [results, setResults] = React.useState([]);
  const [filterSources, setfilterSources] = React.useState(filter_sources);
  const [filterSortby, setfilterSortby] = React.useState("desc");
  const [filterSortusing, setfilterSortusing] = React.useState("relevance");

  

  React.useEffect(() => {
    socket.on('connect', function() {
        socket.emit('join', {data: 'Client connected!', cid: socket.id});
    });
    socket.on('results', function(msg) {
        setResults(msg.results)  
    });
    return () => {
      // cleanup
    }
  }, [results])

  React.useEffect(() => {
    socket.on('new_tweets', function(msg) {
      setNewTweetCount(msg.count)  
    });
    return () => {
      // cleanup
    }
  }, [newTweetCount])

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
    
  };

  const handleSearchClick = (event) => {
    var st = searchTerm.current.value;
    var f_src = filterSources;
    var f_sortby = filterSortby;
    var f_sortusing = filterSortusing;
    if(st==="") return;

    // console.log(st, f_src, f_sortby, f_sortusing);
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
        if(search_grid['fq'].slice(-1)==","){
          search_grid['fq'] = search_grid['fq'].slice(0,-1);
        }
        search_grid['fq'] += ')'
    }
    search_grid['sort'] = f_sortusing+ ' ' + f_sortby;
    
    console.log(search_grid);
    socket.emit('search', {search_params: search_grid, cid: socket.id});
    console.log("sent");
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
            <Typography variant="subtitle1" align="center" color="primary" gutterBottom> Get live stocks tweets Lorem ipsum dolor sit amet consectetur, adipisicing elit.</Typography>
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
                    // labelId="demo-simple-select-label"
                    // id="demo-simple-select"
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
                    // labelId="demo-simple-select-label"
                    // id="demo-simple-select"
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
                    // labelId="demo-mutiple-checkbox-label"
                    // id="demo-mutiple-checkbox"
                    multiple
                    value={filterSources}
                    onChange={handleFilterSourcesChange}
                    input={<Input />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                    
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
        <Grid container item lg={6} xs={10}>
        {
          results.map(result => (
            // <Box py={1}>
              <Paper className={classes.papertweet}>
                <Grid container item xs={12}>

                  <Grid container item xs={3} sm={2} md={1}>
                  <Link target="_blank" underline="none" href={"http://www.twitter.com/"+ result.username}>
                    <Avatar alt={result.username} src={result.userpic} className={classes.avatar}/>
                  </Link>
                  </Grid>

                  <Grid container item xs={9} sm={10} md={11}>

                    <Grid container item xs={12} style={{alignItems: "baseline" }}>
                      <Box mr={1}>
                      <Link target="_blank" href={"http://www.twitter.com/"+ result.username}>
                        <Typography variant="h6" color="textPrimary" >{result.username}</Typography>
                      </Link>
                      </Box>
                      <Typography variant="body2" color="textPrimary">{result.tweetcreatedts}</Typography>
                    </Grid>

                    <Box my={1}>
                      <Grid container item xs={12} >
                        <Typography variant="body1" color="textPrimary" align="left">{result.tweettext}</Typography>
                      </Grid>
                    </Box>
                    
                    <Grid container item xs={12} style={{alignItems: "center" }}>
                        <StarBorderIcon />
                        <Box mr={2}>
                        <Typography variant="subtitle2" color="textPrimary">{result.tweetfavcount}</Typography>
                        </Box>
                        <RepeatIcon />
                        <Typography variant="subtitle2" color="textPrimary">{result.tweetretweetcount}</Typography>
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