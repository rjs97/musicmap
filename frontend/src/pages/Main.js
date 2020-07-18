import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Suggest from './Suggest';
import Home from './Home';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route exact path='/suggest' component={Suggest}></Route>
      <Route exact path='/map' component={Home}></Route>
    </Switch>
  );
}

export default Main
