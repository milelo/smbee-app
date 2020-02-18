import React from 'react';
//import { makeStyles } from '@material-ui/core/styles';

import {
    Toolbar,
    Typography,
    IconButton,
} from '@material-ui/core';
import CoreAppBar from '@material-ui/core/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
//import PauseIcon from '@material-ui/icons/Pause';
import PauseIcon from '@material-ui/icons/PauseCircleOutline'
//import PlayIcon from '@material-ui/icons/PlayArrow';
import PlayIcon from '@material-ui/icons/PlayCircleOutline';
//import AccountCircle from '@material-ui/icons/AccountCircle';
//import Switch from '@material-ui/core/Switch';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
//import FormGroup from '@material-ui/core/FormGroup';
//import MenuItem from '@material-ui/core/MenuItem';
//import Menu from '@material-ui/core/Menu';


export default function AppBar(props) {
    const { title, running, dispatcher} = props;
    return (
        <CoreAppBar position="sticky">
            <Toolbar>
                <IconButton edge="start"  color="inherit" aria-label="menu" onClick={dispatcher.openMenu}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" >
                    {title}
                </Typography>
                
                <IconButton edge="start"  color="inherit" aria-label="menu" onClick={dispatcher.toggleRunning}>
                    {running ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
            </Toolbar>
        </CoreAppBar>
        );
        
}

