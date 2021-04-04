import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, CssBaseline, Container, AppBar, Toolbar, TextField, IconButton, Input, Box, Grid, Paper, Avatar, Checkbox, FormControl, InputLabel, Select, MenuItem, ListItemText } from '@material-ui/core';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import SearchIcon from '@material-ui/icons/Search';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import RepeatIcon from '@material-ui/icons/Repeat';
import grey from '@material-ui/core/colors/grey';

const filter_sources = ['EliteOptions2', 'WarlusTrades', 'canuck2usa', 'OnlyGreenTrades', 'Ultra_Calls', 'MarketBeatCom', 'stockstobuy', 'TickerReport', 'AmericanBanking','SeekingAlpha', 'MarketRebels', 'TradeOnTheWire1'];

const results = [
  {
    'username': 'chuanbin',
    'tweettext': 'tweet1 content',
    'tweetcreatedts':'<time now>',
    'tweetfavcount':'5',
    'tweetretweetcount': '2'
  },
  {
    'username': 'phoechuanbin',
    'tweettext': 'tweet2 content',
    'tweetcreatedts':'<time +1>',
    'tweetfavcount':'2',
    'tweetretweetcount': '3'
  },
  {
    'username': 'bin',
    'tweettext': 'tweet3 content',
    'tweetcreatedts':'<time +2>',
    'tweetfavcount':'5',
    'tweetretweetcount': '11'
  },
  {
    'username': 'chuan',
    'tweettext': 'tweet4 content',
    'tweetcreatedts':'<time +3>',
    'tweetfavcount':'8',
    'tweetretweetcount': '1'
  }
]

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

  // const componentRef = React.useRef();
  const [filterSources, setfilterSources] = React.useState([]);
  const [filterSortby, setfilterSortby] = React.useState([]);
  const [filterSortusing, setfilterSortusing] = React.useState([]);

  const handleFilterSourcesChange = (event) => {
    setfilterSources(event.target.value);
  };

  const handleFilterSortbyChange = (event) => {
    setfilterSortby(event.target.value);
  };

  const handleFilterSortusingChange = (event) => {
    setfilterSortusing(event.target.value);
  };

  const handleSearchClick = (event) => {
    // console.log(searchterm);
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
              <TextField variant="outlined" label="Search for" color="secondary" fullWidth/>
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
                    <MenuItem value={1}>Relevance</MenuItem>
                    <MenuItem value={2}>Favourite Count</MenuItem>
                    <MenuItem value={3}>Retweet Count</MenuItem>
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
                  >
                    <MenuItem value={1}>Ascending</MenuItem>
                    <MenuItem value={2}>Descending</MenuItem>
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
          
            
          
          


          {/* <Button variant="outlined" align="center"><SearchIcon />Search Now</Button> */}
        
      </Container>
      <Container align='center' className={classes.resultContainer} >
        <Box py={2}>
        <Grid container item lg={12} xs={12} justify="center">
          <Typography variant="h4" color="primary" align="center">Results</Typography>
        </Grid>
        </Box>
        <Grid container item lg={6} xs={10}>
        {
          results.map(result => (
            // <Box py={1}>
              <Paper className={classes.papertweet}>
                <Grid container item xs={12}>

                  <Grid container item xs={3} sm={2} md={1}>
                    <Avatar alt="Remy Sharp" src="https://picsum.photos/45/45" className={classes.avatar}/>
                  </Grid>

                  <Grid container item xs={9} sm={10} md={11}>

                    <Grid container item xs={12} style={{alignItems: "baseline" }}>
                      <Box mr={1}>
                      <Typography variant="h6" color="textPrimary" >{result.username}</Typography>
                      </Box>
                      <Typography variant="body2" color="textPrimary">{result.tweetcreatedts}</Typography>
                    </Grid>

                    <Box my={1}>
                      <Grid container item xs={12} >
                        <Typography variant="body1" color="textPrimary" >{result.tweettext}</Typography>
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