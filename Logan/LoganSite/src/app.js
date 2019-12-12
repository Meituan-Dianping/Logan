import React, { Component } from "react";
import {Switch, Route, Redirect} from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router'
import {Layout} from "antd";
import {history} from "./store";
import NativeList from "./views/native-list";
import NativeLogDetail from "./views/native-log-detail";
import WebList from "./views/web-list";
import WebLogDetail from "./views/web-detail";
import Sider from "./common/components/Sider/Sider";
import "antd/dist/antd.css";
import "./app.scss";

class App extends Component {

  componentDidCatch(error, errorInfo) {
    console.log(error);
  }

  render() {
    return (
      <ConnectedRouter history={history}>
        <>
          <Layout style={{height: "100%"}}>
            <Sider/>
            <div className="app">
              <Switch>
                <Redirect exact from="/" to="/native-list"/>
                <Route exact path="/native-list" component={NativeList}/>
                <Route exact path="/native-log-detail" component={NativeLogDetail}/>
                <Route exact path="/web-list" component={WebList}/>
                <Route exact path="/web-detail" component={WebLogDetail}/>
              </Switch>
            </div>
          </Layout>
        </>
      </ConnectedRouter>
    );
  }
}

export default App;
