import React from 'react'
import { Switch, Route } from 'react-router-dom'

import ExtensionLanding from '../components/ExtensionLanding'
import Home from './Home'

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route path='/suggest' component={ExtensionLanding}></Route>
      <Route exact path='/map' component={Home}></Route>
    </Switch>
  );
}

export default Main
