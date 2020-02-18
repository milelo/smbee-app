import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import HomeIcon from '@material-ui/icons/Home';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}))

function Icon(props) {
  //Gives a warning when inlined in Item
  return props.icon ? React.createElement(props.icon) : null
}

function Item(props) {
  return (
    <ListItem button onClick={props.onClick}>
      <ListItemIcon><Icon {...props} /></ListItemIcon>
      <ListItemText primary={props.text} />
    </ListItem>
  );
}

export default function MainMenu(props) {
  const classes = useStyles();
  const { dispatcher } = props
  return (
    <div className={classes.root}>
      <List component="nav" aria-label="menu items">
        <Item icon={HomeIcon} text={"Home"} onClick={dispatcher.homeView} />
        <Item icon={EditIcon} text={"Edit"} onClick={dispatcher.sequenceView} />
      </List>
      <Divider />
      <List component="nav" aria-label="links">
      </List>
    </div>
  );
}
