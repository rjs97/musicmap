import React from 'react'
import { Switch, Route } from 'react-router-dom'

import ExtensionLanding from './ExtensionLanding'
import AddConnection from './AddConnection'
import Home from './Home'
import Info from './Info'
import ConnPage from './ConnPage'
import RelPage from './RelPage'

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route path='/suggest' component={ExtensionLanding}></Route>
      <Route exact path='/map' component={Home}></Route>
      <Route exact path='/add' component={AddConnection}></Route>
      <Route exact path='/info' component={Info}></Route>
      <Route path='/conn/:linkid/:type/:id' component={ConnPage}></Route>
      <Route path='/conn/:linkid' component={RelPage}></Route>
    </Switch>
  );
}

export default Main
