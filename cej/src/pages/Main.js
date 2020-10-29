import React from 'react'
import { Switch, Route } from 'react-router-dom'

import ExtensionLanding from './ExtensionLanding'
import AddConnection from './AddConnection'
import Home from './Home'

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route path='/suggest' component={ExtensionLanding}></Route>
      <Route exact path='/map' component={Home}></Route>
      <Route exact path='/add' component={AddConnection}></Route>
    </Switch>
  );
}

export default Main
