import "antd/dist/antd.css";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Layout, Menu, Icon } from "antd";
import { isEqual } from "lodash";
import image from "./new_logan_logo_white.png";
import "./style.scss";

class Sider extends Component {

  state = {
    selectedKeys: ["0"]
  };

  render() {
    return (
      <Layout.Sider style={style.sider} trigger={null}>
        <div>
          <div className="sider-logo" style={style.logo} />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["0"]} selectedKeys={this.state.selectedKeys} onClick={this.handleMenuClick}>
            <Menu.Item key="0">
              <Icon type="mobile" />
              <span>Native日志</span>
            </Menu.Item>
            <Menu.Item key="1">
              <Icon type="html5" />
              <span>Web日志</span>
            </Menu.Item>
          </Menu>
        </div>
      </Layout.Sider>
    );
  }

  componentDidMount() {
    const {pathname} = this.props;
    if (pathname === "/native-list" || pathname === "/native-log-detail") {
      this.setState({
        selectedKeys: ["0"]
      });
    } else if (pathname === "/web-list" || pathname === "/web-detail") {
      this.setState({
        selectedKeys: ["1"]
      });
    } else {
      this.setState({
        selectedKeys: ["0"]
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !isEqual(nextState, this.state) || !isEqual(nextProps, this.props);
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const {pathname} = this.props;
    if (pathname === "/native-list" || pathname === "/native-log-detail") {
      this.setState({
        selectedKeys: ["0"]
      });
    } else if (pathname === "/web-list" || pathname === "/web-detail") {
      this.setState({
        selectedKeys: ["1"]
      });
    } else {
      this.setState({
        selectedKeys: ["0"]
      });
    }
  }

  handleMenuClick = ({ key }) => {
    if (key === "0") {
      window.location.hash = "#/native-list";
      this.setState({
        selectedKeys: ["0"]
      });
    } else if (key === "1") {
      window.location.hash ="#/web-list";
      this.setState({
        selectedKeys: ["1"]
      });
    } else {
      window.location.hash = "#/native-list";
      this.setState({
        selectedKeys: ["0"]
      });
    }
  }
}

const style = {
  sider: {
    height: "100%"
  },
  logo: {
    backgroundImage: image,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: "32px",
    height: "80px",
    margin: "5px",
    cursor: "pointer"
  }
};


function mapStateToProps(state) {
  return {
    pathname: state.router.location.pathname,
    search: state.router.location.search,
    hash: state.router.location.hash,
  }
}

export default connect(mapStateToProps)(Sider);
